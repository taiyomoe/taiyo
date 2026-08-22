import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

describe("GET /users/:id/following", () => {
  test("lists users the target follows", async ({ app, services }) => {
    const { userId: targetId } = await signInAs(services)
    const { userId: followeeA } = await signInAs(services)
    const { userId: followeeB } = await signInAs(services)

    await services.db
      .insertInto("userFollows")
      .values([
        { followerId: targetId, followingId: followeeA },
        { followerId: targetId, followingId: followeeB },
      ])
      .execute()

    const res = await api<{ id: string }[]>(app, `/users/${targetId}/following`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data).toHaveLength(2)
  })

  test("returns USER_NOT_FOUND for an unknown id", async ({ app }) => {
    const res = await api(app, `/users/${randomUUID()}/following`)

    expect(res.status).toBe(404)
  })

  test("returns VALIDATION_ERROR for a non-UUID id", async ({ app }) => {
    const res = await api(app, `/users/not-a-uuid/following`)

    expect(res.status).toBe(422)
  })
})
