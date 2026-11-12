import { describe, expect } from "vitest"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

type VoteResult = { upvoteCount: number; viewerVoted: boolean }

describe("PUT/DELETE /lists/:id/vote", () => {
  test("upvoting is idempotent and unvoting takes it back", async ({ app, services }) => {
    const { userId: ownerId } = await signInAs(services)
    const { headers } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId: ownerId, name: "Open", visibility: "PUBLIC" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const first = await api<VoteResult>(app, `/lists/${list.id}/vote`, { method: "PUT", headers })
    const second = await api<VoteResult>(app, `/lists/${list.id}/vote`, { method: "PUT", headers })

    expect(first.body).toMatchObject({ data: { upvoteCount: 1, viewerVoted: true } })
    expect(second.body).toMatchObject({ data: { upvoteCount: 1, viewerVoted: true } })

    const removed = await api<VoteResult>(app, `/lists/${list.id}/vote`, {
      method: "DELETE",
      headers,
    })

    expect(removed.body).toMatchObject({ data: { upvoteCount: 0, viewerVoted: false } })
  })

  test("a vote does not bump the list's updatedAt", async ({ app, services }) => {
    const { userId: ownerId } = await signInAs(services)
    const { headers } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({
        userId: ownerId,
        name: "Open",
        visibility: "PUBLIC",
        updatedAt: new Date("2026-01-01T00:00:00Z"),
      })
      .returning(["id", "updatedAt"])
      .executeTakeFirstOrThrow()

    await api(app, `/lists/${list.id}/vote`, { method: "PUT", headers })

    const after = await services.db
      .selectFrom("userLists")
      .select("updatedAt")
      .where("id", "=", list.id)
      .executeTakeFirstOrThrow()

    expect(after.updatedAt).toEqual(list.updatedAt)
  })

  test("the owner cannot upvote their own list", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId, name: "Mine", visibility: "PUBLIC" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/lists/${list.id}/vote`, { method: "PUT", headers })

    expect(res.status).toBe(409)
    expect(res.body).toMatchObject({ success: false, code: "LIST_SELF_VOTE" })
  })

  test("a PRIVATE list cannot be upvoted", async ({ app, services }) => {
    const { userId: ownerId } = await signInAs(services)
    const { headers } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId: ownerId, name: "Hidden", visibility: "PRIVATE" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/lists/${list.id}/vote`, { method: "PUT", headers })

    expect(res.status).toBe(404)
    expect(res.body).toMatchObject({ success: false, code: "LIST_NOT_FOUND" })
  })

  test("rejects unauthenticated requests", async ({ app, services }) => {
    const { userId } = await signInAs(services)
    const list = await services.db
      .insertInto("userLists")
      .values({ userId, name: "Open", visibility: "PUBLIC" })
      .returning("id")
      .executeTakeFirstOrThrow()
    const res = await api(app, `/lists/${list.id}/vote`, { method: "PUT" })

    expect(res.status).toBe(401)
  })
})
