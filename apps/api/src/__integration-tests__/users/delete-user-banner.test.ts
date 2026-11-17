import { ListObjectsV2Command } from "@aws-sdk/client-s3"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { tinyPng } from "../helpers/fixtures"
import { api } from "../helpers/request"
import { test } from "../setup"

const deleteBanner = (
  app: Parameters<typeof api>[0],
  userId: string,
  headers?: Record<string, string>,
) =>
  api(app, `/users/${userId}/banner`, {
    method: "DELETE",
    ...(headers === undefined ? {} : { headers }),
  })
const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}

describe("DELETE /users/:id/banner", () => {
  test("removes the profile banner of the user and its stored image", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const target = await signInAs(services, { role: "UPLOADER" })
    const form = new FormData()

    form.append("file", await tinyPng())

    for (const [key, value] of Object.entries({
      x: "0",
      y: "0",
      width: "1",
      height: "1",
      rotation: "0",
      flipX: "false",
      flipY: "false",
    })) {
      form.append(`crop.${key}`, value)
    }

    const uploaded = await api(app, "/users/me/banner", {
      method: "PUT",
      headers: target.headers,
      form,
    })

    expect(uploaded.status).toBe(200)

    const res = await deleteBanner(app, target.userId, admin.headers)

    expect(res.status).toBe(200)
    expect(res.body.success && res.body.data).toEqual({ id: target.userId, bannerUrl: null })

    const profile = await services.db
      .selectFrom("userProfiles")
      .select("banner")
      .where("userId", "=", target.userId)
      .executeTakeFirstOrThrow()
    const listing = await services.s3.send(
      new ListObjectsV2Command({
        Bucket: services.s3Bucket,
        Prefix: `users/${target.userId}/banners/`,
      }),
    )

    expect(profile.banner).toBeNull()
    expect(listing.Contents ?? []).toHaveLength(0)

    const [log] = await findAuditLogs(services, "admin.USER_BANNER_REMOVE")

    expect(log).toMatchObject({
      outcome: "success",
      actorId: admin.userId,
      targetType: "user",
      targetId: target.userId,
    })
    expect(log?.event).toMatchObject({ audit: { changes: { after: { banner: null } } } })
  })

  test("does nothing when the user has no banner", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const { userId } = await signInAs(services)
    const res = await deleteBanner(app, userId, headers)

    expect(res.status).toBe(200)
    expect(res.body.success && res.body.data).toEqual({ id: userId, bannerUrl: null })
  })

  test("lets moderators edit regular users only, and nobody edit themselves", async ({
    app,
    services,
  }) => {
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const admin = await signInAs(services, { role: "ADMIN" })
    const uploader = await signInAs(services, { role: "UPLOADER" })

    expectFailure(await deleteBanner(app, uploader.userId, moderator.headers), 403, "FORBIDDEN")
    expectFailure(await deleteBanner(app, moderator.userId, moderator.headers), 403, "FORBIDDEN")
    expectFailure(await deleteBanner(app, admin.userId, admin.headers), 403, "FORBIDDEN")
  })

  test("refuses regular users before the user is looked up", async ({ app, services }) => {
    const user = await signInAs(services)
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const missingId = randomUUID()

    expectFailure(await deleteBanner(app, missingId, user.headers), 403, "FORBIDDEN")
    expectFailure(await deleteBanner(app, missingId, moderator.headers), 404, "USER_NOT_FOUND")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    expectFailure(await deleteBanner(app, randomUUID()), 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR", banned: true })
    const { userId } = await signInAs(services)

    expectFailure(await deleteBanner(app, userId, headers), 403, "FORBIDDEN")
  })

  test("rejects an invalid ID with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })

    expectFailure(await deleteBanner(app, "not-a-uuid", headers), 422, "VALIDATION_ERROR")
  })
})
