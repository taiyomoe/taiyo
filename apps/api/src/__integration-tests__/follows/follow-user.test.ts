import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

describe("POST /users/:id/follow", () => {
  test("creates a follow edge", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const { userId: targetId } = await signInAs(services)
    const res = await api(app, `/users/${targetId}/follow`, { method: "POST", headers })

    expect(res.status).toBe(201)

    const row = await services.db
      .selectFrom("userFollows")
      .selectAll()
      .where("followerId", "=", userId)
      .where("followingId", "=", targetId)
      .executeTakeFirst()

    expect(row).toBeDefined()
  })

  test("returns FOLLOW_SELF when targeting yourself", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const res = await api(app, `/users/${userId}/follow`, { method: "POST", headers })

    expect(res.status).toBe(409)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("FOLLOW_SELF")
  })

  test("returns ALREADY_FOLLOWING on duplicate follow", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const { userId: targetId } = await signInAs(services)

    await api(app, `/users/${targetId}/follow`, { method: "POST", headers })

    const res = await api(app, `/users/${targetId}/follow`, { method: "POST", headers })

    expect(res.status).toBe(409)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("ALREADY_FOLLOWING")
  })

  test("returns USER_NOT_FOUND for an unknown target", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/users/${randomUUID()}/follow`, { method: "POST", headers })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("USER_NOT_FOUND")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/users/${randomUUID()}/follow`, { method: "POST" })

    expect(res.status).toBe(401)
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { banned: true })
    const { userId: targetId } = await signInAs(services)
    const res = await api(app, `/users/${targetId}/follow`, { method: "POST", headers })

    expect(res.status).toBe(403)
  })

  test("returns VALIDATION_ERROR for a non-UUID id", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/users/not-a-uuid/follow`, { method: "POST", headers })

    expect(res.status).toBe(422)
  })

  test("earns the followers achievement with the 25th follower", async ({ app, services }) => {
    const target = await signInAs(services)
    const followers = await Promise.all(Array.from({ length: 25 }, () => signInAs(services)))

    await services.db
      .insertInto("userFollows")
      .values(
        followers.slice(1).map((follower) => ({
          followerId: follower.userId,
          followingId: target.userId,
        })),
      )
      .execute()

    const res = await api(app, `/users/${target.userId}/follow`, {
      method: "POST",
      headers: followers[0]?.headers ?? {},
    })

    expect(res.status).toBe(201)

    const earned = await services.db
      .selectFrom("userAchievements")
      .select("key")
      .where("userId", "=", target.userId)
      .execute()

    expect(earned).toEqual([{ key: "followers25" }])
  })
})
