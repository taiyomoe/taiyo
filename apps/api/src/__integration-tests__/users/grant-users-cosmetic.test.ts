import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import type { ApiResult } from "../helpers/request"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

type BulkResult = { done: string[]; skipped: Array<{ id: string; reason: string }> }

const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}
const getOwned = ({ db }: Services, userIds: string[]) =>
  db
    .selectFrom("userCosmetics")
    .select(["userId", "kind", "key"])
    .where("userId", "in", userIds)
    .execute()
const getEquipped = ({ db }: Services, userId: string) =>
  db
    .selectFrom("users")
    .leftJoin("userProfiles", "userProfiles.userId", "users.id")
    .select(["users.nameEffect", "users.avatarBorder", "userProfiles.title"])
    .where("users.id", "=", userId)
    .executeTakeFirstOrThrow()

describe("POST /users/cosmetics", () => {
  test("gives the cosmetic, keeps it once and reports the missing users", async ({
    app,
    services,
  }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const owner = await signInAs(services)
    const newcomer = await signInAs(services)
    const missing = randomUUID()

    await services.db
      .insertInto("userCosmetics")
      .values({ userId: owner.userId, kind: "NAME_EFFECT", key: "gold" })
      .execute()

    const res = await api<BulkResult>(app, "/users/cosmetics", {
      method: "POST",
      headers: admin.headers,
      json: { userIds: [owner.userId, newcomer.userId, missing], kind: "NAME_EFFECT", key: "gold" },
    })

    expect(res.status).toBe(201)
    expect(res.body.success && res.body.data).toEqual({
      done: [owner.userId, newcomer.userId],
      skipped: [{ id: missing, reason: "NOT_FOUND" }],
    })
    const owned = await getOwned(services, [owner.userId, newcomer.userId])

    expect(owned).toHaveLength(2)
    expect(owned).toEqual(
      expect.arrayContaining(
        [owner.userId, newcomer.userId].map((userId) => ({
          userId,
          kind: "NAME_EFFECT",
          key: "gold",
        })),
      ),
    )
    expect((await getEquipped(services, newcomer.userId)).nameEffect).toBeNull()

    const equipped = await api(app, "/users/me/cosmetics", {
      method: "PATCH",
      headers: newcomer.headers,
      json: { nameEffect: "gold" },
    })

    expect(equipped.status).toBe(200)

    const [log] = await findAuditLogs(services, "admin.COSMETIC_GRANT_MANY")

    expect(log?.event).toMatchObject({
      audit: {
        changes: {
          after: {
            userIds: [owner.userId, newcomer.userId],
            kind: "NAME_EFFECT",
            key: "gold",
            equip: false,
          },
        },
      },
    })
  })

  test("equips an avatar border", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const user = await signInAs(services)
    const res = await api(app, "/users/cosmetics", {
      method: "POST",
      headers: admin.headers,
      json: { userIds: [user.userId], kind: "AVATAR_BORDER", key: "eclipse", equip: true },
    })

    expect(res.status).toBe(201)
    expect(await getOwned(services, [user.userId])).toEqual([
      { userId: user.userId, kind: "AVATAR_BORDER", key: "eclipse" },
    ])
    expect(await getEquipped(services, user.userId)).toEqual({
      nameEffect: null,
      avatarBorder: "eclipse",
      title: null,
    })
  })

  test("equips a title and creates the missing profile", async ({ app, services }) => {
    const admin = await signInAs(services, { role: "ADMIN" })
    const withProfile = await signInAs(services)
    const withoutProfile = await signInAs(services)

    await services.db
      .insertInto("userProfiles")
      .values({ userId: withProfile.userId, title: "reader" })
      .execute()

    const res = await api(app, "/users/cosmetics", {
      method: "POST",
      headers: admin.headers,
      json: {
        userIds: [withProfile.userId, withoutProfile.userId],
        kind: "TITLE",
        key: "legend",
        equip: true,
      },
    })

    expect(res.status).toBe(201)
    expect((await getEquipped(services, withProfile.userId)).title).toBe("legend")
    expect((await getEquipped(services, withoutProfile.userId)).title).toBe("legend")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, "/users/cosmetics", {
      method: "POST",
      json: { userIds: [randomUUID()], kind: "NAME_EFFECT", key: "gold" },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned admins with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })
    const res = await api(app, "/users/cosmetics", {
      method: "POST",
      headers,
      json: { userIds: [randomUUID()], kind: "NAME_EFFECT", key: "gold" },
    })

    expectFailure(res, 403, "FORBIDDEN")
  })

  test("rejects moderators with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const user = await signInAs(services)
    const res = await api(app, "/users/cosmetics", {
      method: "POST",
      headers,
      json: { userIds: [user.userId], kind: "NAME_EFFECT", key: "gold" },
    })

    expectFailure(res, 403, "FORBIDDEN")
    expect(await getOwned(services, [user.userId])).toEqual([])
  })

  test("rejects a key of another kind with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const res = await api(app, "/users/cosmetics", {
      method: "POST",
      headers,
      json: { userIds: [randomUUID()], kind: "TITLE", key: "gold" },
    })

    expectFailure(res, 422, "VALIDATION_ERROR")
  })
})
