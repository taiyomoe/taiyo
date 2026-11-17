import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

type Profile = {
  id: string
  displayUsername: string
  about: Record<string, string>
  city: string | null
}

const patchProfile = (
  app: Parameters<typeof api>[0],
  userId: string,
  headers: Record<string, string> | undefined,
  json: unknown,
) =>
  api<Profile>(app, `/users/${userId}/profile`, {
    method: "PATCH",
    ...(headers === undefined ? {} : { headers }),
    json,
  })
const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("PATCH /users/:id/profile", () => {
  test("replaces the display name, about text and city of the user", async ({ app, services }) => {
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const { userId } = await signInAs(services)
    const displayUsername = `Renamed ${userId.slice(0, 8)}`

    await services.db
      .insertInto("userProfiles")
      .values({ userId, about: { en: "Rude text", fr: "Texte grossier" }, city: "Rude city" })
      .execute()

    const res = await patchProfile(app, userId, moderator.headers, {
      displayUsername,
      about: { en: "Clean text", pt_br: "" },
      city: "",
    })

    expect(res.status).toBe(200)
    expect(res.body.success && res.body.data).toEqual({
      id: userId,
      displayUsername,
      about: { en: "Clean text" },
      city: null,
    })

    const user = await services.db
      .selectFrom("users")
      .select(["displayUsername", "name"])
      .where("id", "=", userId)
      .executeTakeFirstOrThrow()
    const profile = await services.db
      .selectFrom("userProfiles")
      .select(["about", "city"])
      .where("userId", "=", userId)
      .executeTakeFirstOrThrow()

    expect(user).toEqual({ displayUsername, name: displayUsername })
    expect(profile).toEqual({ about: { en: "Clean text" }, city: null })

    const [log] = await findAuditLogs(services, "admin.USER_PROFILE_UPDATE")

    expect(log).toMatchObject({
      outcome: "success",
      actorId: moderator.userId,
      targetType: "user",
      targetId: userId,
    })
    expect(log?.event).toMatchObject({
      audit: {
        changes: {
          before: { city: "Rude city", about: { en: "Rude text", fr: "Texte grossier" } },
          after: { displayUsername, city: null, about: { en: "Clean text" } },
        },
      },
    })
  })

  test("creates the profile of a user who has none", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const { userId } = await signInAs(services, { role: "UPLOADER" })
    const res = await patchProfile(app, userId, admin.headers, { city: "Lisbon" })

    expect(res.status).toBe(200)

    const profile = await services.db
      .selectFrom("userProfiles")
      .select(["about", "city"])
      .where("userId", "=", userId)
      .executeTakeFirstOrThrow()

    expect(profile).toEqual({ about: {}, city: "Lisbon" })
  })

  test("rejects a display name another user holds with DISPLAY_NAME_TAKEN", async ({
    app,
    services,
  }) => {
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const { userId } = await signInAs(services)
    const other = await signInAs(services)
    const { displayUsername } = await services.db
      .selectFrom("users")
      .select("displayUsername")
      .where("id", "=", other.userId)
      .executeTakeFirstOrThrow()
    const res = await patchProfile(app, userId, moderator.headers, {
      displayUsername: displayUsername.toUpperCase(),
    })

    expectFailure(res, 409, "DISPLAY_NAME_TAKEN")
  })

  test("lets moderators edit regular users only, and nobody edit themselves", async ({
    app,
    services,
  }) => {
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const admin = await signInAs(services, { role: "ADMIN" })
    const uploader = await signInAs(services, { role: "UPLOADER" })
    const json = { city: "Lisbon" }

    expectFailure(
      await patchProfile(app, uploader.userId, moderator.headers, json),
      403,
      "FORBIDDEN",
    )
    expectFailure(
      await patchProfile(app, moderator.userId, moderator.headers, json),
      403,
      "FORBIDDEN",
    )
    expectFailure(await patchProfile(app, admin.userId, admin.headers, json), 403, "FORBIDDEN")
  })

  test("refuses regular users before the user is looked up", async ({ app, services }) => {
    const user = await signInAs(services)
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const missingId = randomUUID()

    expectFailure(
      await patchProfile(app, missingId, user.headers, { city: "Lisbon" }),
      403,
      "FORBIDDEN",
    )
    expectFailure(
      await patchProfile(app, missingId, moderator.headers, { city: "Lisbon" }),
      404,
      "USER_NOT_FOUND",
    )
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    expectFailure(
      await patchProfile(app, randomUUID(), undefined, { city: "Lisbon" }),
      401,
      "UNAUTHORIZED",
    )
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR", banned: true })
    const { userId } = await signInAs(services)

    expectFailure(await patchProfile(app, userId, headers, { city: "Lisbon" }), 403, "FORBIDDEN")
  })

  test("rejects an empty body with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const { userId } = await signInAs(services)

    expectFailure(await patchProfile(app, userId, headers, {}), 422, "VALIDATION_ERROR")
  })
})
