import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

describe("DELETE /users/:id/follow", () => {
  test("removes the follow edge", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const { userId: targetId } = await signInAs(services)

    await services.db
      .insertInto("userFollows")
      .values({ followerId: userId, followingId: targetId })
      .execute()

    const res = await api(app, `/users/${targetId}/follow`, { method: "DELETE", headers })

    expect(res.status).toBe(200)

    const row = await services.db
      .selectFrom("userFollows")
      .selectAll()
      .where("followerId", "=", userId)
      .where("followingId", "=", targetId)
      .executeTakeFirst()

    expect(row).toBeUndefined()
  })

  test("returns NOT_FOLLOWING when no edge exists", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const { userId: targetId } = await signInAs(services)
    const res = await api(app, `/users/${targetId}/follow`, { method: "DELETE", headers })

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("NOT_FOLLOWING")
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/users/${randomUUID()}/follow`, { method: "DELETE" })

    expect(res.status).toBe(401)
  })

  test("returns VALIDATION_ERROR for a non-UUID id", async ({ app, services }) => {
    const { headers } = await signInAs(services)
    const res = await api(app, `/users/not-a-uuid/follow`, { method: "DELETE", headers })

    expect(res.status).toBe(422)
  })
})
