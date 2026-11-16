import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { ApiResult } from "../helpers/request"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedGroup, seedMedia } from "../helpers/seed"
import { test } from "../setup"
import { postComment, postReply } from "./helpers"

type ManagedComment = {
  id: string
  content: string
  imageCount: number
  replyCount: number
  isReply: boolean
  deletedAt: string | null
  deletion: string | null
  author: { id: string } | null
  target: { type: string; id: string; label: string | null; username: string | null }
}

const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}
const getData = <T>(res: ApiResult<T>) => {
  expect(res.status).toBe(200)

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body
}

describe("GET /comments/managed", () => {
  test("lists the comments of an author, newest first, with their target", async ({
    app,
    services,
  }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const author = await signInAs(services)
    const mediaId = await seedMedia(services, author.userId)
    const groupId = await seedGroup(services, author.userId, "Zyxwv Scans")
    const root = await postComment(app, author.headers, { type: "MEDIA", id: mediaId }, "Root")
    const reply = await postReply(app, author.headers, root.id, "A reply")
    const onGroup = await postComment(app, author.headers, { type: "GROUP", id: groupId }, "Group")

    await services.db
      .updateTable("comments")
      .set({ content: `Look at this\n![](image:${randomUUID()})` })
      .where("id", "=", onGroup.id)
      .execute()

    for (const [id, createdAt] of [
      [root.id, "2026-01-01T00:00:00Z"],
      [reply.id, "2026-01-02T00:00:00Z"],
      [onGroup.id, "2026-01-03T00:00:00Z"],
    ] as const) {
      await services.db
        .updateTable("comments")
        .set({ createdAt: new Date(createdAt) })
        .where("id", "=", id)
        .execute()
    }

    const body = getData(
      await api<ManagedComment[]>(app, `/comments/managed?authorId=${author.userId}`, {
        headers,
      }),
    )

    expect(body.data.map((comment) => comment.id)).toEqual([onGroup.id, reply.id, root.id])
    expect(body.meta).toEqual({ page: 1, perPage: 20, total: 3 })
    expect(body.data[0]).toMatchObject({
      imageCount: 1,
      isReply: false,
      replyCount: 0,
      author: { id: author.userId },
      target: { type: "GROUP", id: groupId, label: "Zyxwv Scans", username: null },
    })
    expect(body.data[1]).toMatchObject({ isReply: true, replyCount: 0 })
    expect(body.data[2]).toMatchObject({
      content: "Root",
      imageCount: 0,
      replyCount: 1,
      target: { type: "MEDIA", id: mediaId, label: null },
    })
  })

  test("filters by text, target and page", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const author = await signInAs(services)
    const mediaId = await seedMedia(services, author.userId)
    const groupId = await seedGroup(services, author.userId, "Zyxwv Scans")
    const target = { type: "MEDIA", id: mediaId }
    const first = await postComment(app, author.headers, target, "Spoiler: he wins")
    const second = await postComment(app, author.headers, target, "big SPOILER ahead")

    await postComment(app, author.headers, target, "No secrets here")
    await postComment(app, author.headers, { type: "GROUP", id: groupId }, "spoiler too")

    const bySearch = getData(
      await api<ManagedComment[]>(
        app,
        `/comments/managed?authorId=${author.userId}&target=MEDIA&search=spoiler`,
        { headers },
      ),
    )

    expect(bySearch.data.map((comment) => comment.id).sort()).toEqual([first.id, second.id].sort())

    const paged = getData(
      await api<ManagedComment[]>(
        app,
        `/comments/managed?authorId=${author.userId}&target=MEDIA&search=spoiler&perPage=1&page=2`,
        { headers },
      ),
    )

    expect(paged.data).toHaveLength(1)
    expect(paged.meta).toEqual({ page: 2, perPage: 1, total: 2 })
  })

  test("lists the removed comments with their content when asked", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR" })
    const author = await signInAs(services)
    const target = { type: "MEDIA", id: await seedMedia(services, author.userId) }
    const removed = await postComment(app, author.headers, target, "Rude words")
    const live = await postComment(app, author.headers, target, "Kind words")

    await api(app, `/comments/${removed.id}`, { method: "DELETE", headers })

    const deleted = getData(
      await api<ManagedComment[]>(app, `/comments/managed?authorId=${author.userId}&deleted=true`, {
        headers,
      }),
    )

    expect(deleted.data.map((comment) => comment.id)).toEqual([removed.id])
    expect(deleted.data[0]).toMatchObject({ content: "Rude words", deletion: "MODERATOR" })
    expect(deleted.data[0]?.deletedAt).not.toBeNull()

    const kept = getData(
      await api<ManagedComment[]>(app, `/comments/managed?authorId=${author.userId}`, {
        headers,
      }),
    )

    expect(kept.data.map((comment) => comment.id)).toEqual([live.id])
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    expectFailure(await api(app, "/comments/managed"), 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })

    expectFailure(await api(app, "/comments/managed", { headers }), 403, "FORBIDDEN")
  })

  test("rejects users without the required role with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "UPLOADER" })

    expectFailure(await api(app, "/comments/managed", { headers }), 403, "FORBIDDEN")
  })

  test("returns VALIDATION_ERROR for an unknown target", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })

    expectFailure(
      await api(app, "/comments/managed?target=PLANET", { headers }),
      422,
      "VALIDATION_ERROR",
    )
  })
})
