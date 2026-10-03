import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

describe("GET /users/:id/followers", () => {
  test("lists followers of the target user", async ({ app, services }) => {
    const { userId: targetId } = await signInAs(services)
    const { userId: followerA } = await signInAs(services)
    const { userId: followerB } = await signInAs(services)
    const { userId: followerC } = await signInAs(services)

    await services.db
      .insertInto("userFollows")
      .values([
        { followerId: followerA, followingId: targetId },
        { followerId: followerB, followingId: targetId },
        { followerId: followerC, followingId: targetId },
      ])
      .execute()

    const res = await api<{ id: string }[]>(app, `/users/${targetId}/followers`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toHaveLength(3)
  })

  test("respects perPage and reports total", async ({ app, services }) => {
    const { userId: targetId } = await signInAs(services)
    const { userId: followerA } = await signInAs(services)
    const { userId: followerB } = await signInAs(services)
    const { userId: followerC } = await signInAs(services)

    await services.db
      .insertInto("userFollows")
      .values([
        { followerId: followerA, followingId: targetId },
        { followerId: followerB, followingId: targetId },
        { followerId: followerC, followingId: targetId },
      ])
      .execute()

    const res = await api<{ id: string }[]>(app, `/users/${targetId}/followers?perPage=2`)

    expect(res.status).toBe(200)

    if (!res.body.success) {
      throw new Error("Expected success")
    }

    expect(res.body.data).toHaveLength(2)
    expect(res.body.meta).toMatchObject({ page: 1, perPage: 2, total: 3 })
  })

  test("returns USER_NOT_FOUND for an unknown id", async ({ app }) => {
    const res = await api(app, `/users/${randomUUID()}/followers`)

    expect(res.status).toBe(404)

    if (res.body.success) {
      throw new Error("Expected failure")
    }

    expect(res.body.code).toBe("USER_NOT_FOUND")
  })

  test("returns USER_NOT_FOUND for a banned target", async ({ app, services }) => {
    const { userId: targetId } = await signInAs(services, { banned: true })
    const res = await api(app, `/users/${targetId}/followers`)

    expect(res.status).toBe(404)
  })

  test("returns VALIDATION_ERROR for a non-UUID id", async ({ app }) => {
    const res = await api(app, `/users/not-a-uuid/followers`)

    expect(res.status).toBe(422)
  })
})
