import { describe, expect } from "vitest"
import type { CommentResponse } from "../../utils/comments"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedGroup, seedMedia } from "../helpers/seed"
import { test } from "../setup"
import { expectSuccess, listComments, postComment, postReply, type RootComment } from "./helpers"

describe("listing comments", () => {
  test("is empty before anyone comments and 404s for unknown targets", async ({
    app,
    services,
  }) => {
    const user = await signInAs(services)
    const mediaId = await seedMedia(services, user.userId)
    const empty = await listComments(app, { type: "MEDIA", id: mediaId })

    expect(empty.data).toEqual([])
    expect(empty.meta).toEqual({ nextCursor: null, total: 0 })

    const missing = await api(app, `/comments?targetType=MEDIA&targetId=${crypto.randomUUID()}`)

    expect(missing.status).toBe(404)
  })

  test("pages through comments with cursors in every sort", async ({ app, services }) => {
    const user = await signInAs(services)
    const target = { type: "MEDIA", id: await seedMedia(services, user.userId) }
    const posted: string[] = []

    for (let index = 0; index < 5; index += 1) {
      posted.push((await postComment(app, user.headers, target, `comment ${index}`)).id)
    }

    for (const [sort, expected] of [
      ["newest", [...posted].reverse()],
      ["oldest", posted],
    ] as const) {
      const seen: string[] = []
      let cursor: string | null = null

      do {
        const page: Awaited<ReturnType<typeof listComments>> = await listComments(app, target, {
          query: `&sort=${sort}&limit=2${cursor === null ? "" : `&cursor=${cursor}`}`,
        })

        seen.push(...page.data.map((comment) => comment.id))
        cursor = page.meta.nextCursor
      } while (cursor !== null)

      expect(seen).toEqual(expected)
    }
  })

  test("orders by upvotes in top sort", async ({ app, services }) => {
    const author = await signInAs(services)
    const voters = await Promise.all([signInAs(services), signInAs(services)])
    const target = { type: "GROUP", id: await seedGroup(services, author.userId, "Scans") }
    const first = await postComment(app, author.headers, target, "first")
    const second = await postComment(app, author.headers, target, "second")
    const third = await postComment(app, author.headers, target, "third")

    for (const voter of voters) {
      await api(app, `/comments/${second.id}/vote`, { method: "PUT", headers: voter.headers })
    }

    await api(app, `/comments/${first.id}/vote`, { method: "PUT", headers: voters[0].headers })

    const { data } = await listComments(app, target, { query: "&sort=top" })

    expect(data.map((comment) => [comment.id, comment.upvoteCount])).toEqual([
      [second.id, 2],
      [first.id, 1],
      [third.id, 0],
    ])
  })

  test("only lists comments on published chapters", async ({ app, services }) => {
    const user = await signInAs(services)
    const mediaId = await seedMedia(services, user.userId)
    const pending = await seedChapter(services, {
      mediaId,
      uploaderId: user.userId,
      number: 1,
      status: "PENDING",
    })
    const published = await seedChapter(services, {
      mediaId,
      uploaderId: user.userId,
      number: 2,
      status: "PUBLISHED",
    })
    const denied = await api(app, "/comments", {
      method: "POST",
      headers: user.headers,
      json: { targetType: "CHAPTER", targetId: pending, content: "early" },
    })

    expect(denied.status).toBe(404)

    await postComment(app, user.headers, { type: "CHAPTER", id: published })

    const { meta } = await listComments(app, { type: "CHAPTER", id: published })

    expect(meta.total).toBe(1)
  })
})

describe("replies", () => {
  test("files replies under the top-level comment and records who they answer", async ({
    app,
    services,
  }) => {
    const alice = await signInAs(services)
    const bob = await signInAs(services)
    const target = { type: "USER", id: alice.userId }
    const root = await postComment(app, alice.headers, target, "root")
    const reply = await postReply(app, bob.headers, root.id, "reply")
    const nested = await postReply(app, alice.headers, reply.id, "reply to reply")

    expect(reply).toMatchObject({ parentId: root.id, replyTo: null })
    expect(nested.parentId).toBe(root.id)
    expect(nested.replyTo?.id).toBe(reply.id)
    expect(nested.replyTo?.author?.username).toBe(reply.author?.username)

    const { data, meta } = await listComments(app, target)

    expect(meta.total).toBe(3)
    expect(data).toHaveLength(1)
    expect(data[0]?.replyCount).toBe(2)
    expect(data[0]?.replies.map((item) => item.id)).toEqual([reply.id, nested.id])
  })

  test("pages through replies past the preview", async ({ app, services }) => {
    const user = await signInAs(services)
    const target = { type: "MEDIA", id: await seedMedia(services, user.userId) }
    const root = await postComment(app, user.headers, target)
    const replies: string[] = []

    for (let index = 0; index < 5; index += 1) {
      replies.push((await postReply(app, user.headers, root.id, `reply ${index}`)).id)
    }

    const { data } = await listComments(app, target)

    expect(data[0]?.replies.map((item) => item.id)).toEqual(replies.slice(0, 3))

    const firstPage = await api<CommentResponse[]>(app, `/comments/${root.id}/replies?limit=4`)

    if (!firstPage.body.success) {
      throw new Error("Expected success")
    }

    expect(firstPage.body.data.map((item) => item.id)).toEqual(replies.slice(0, 4))

    const cursor = String(firstPage.body.meta?.nextCursor)
    const secondPage = expectSuccess(
      await api<CommentResponse[]>(app, `/comments/${root.id}/replies?limit=4&cursor=${cursor}`),
    )

    expect(secondPage.map((item) => item.id)).toEqual(replies.slice(4))
  })
})

describe("editing", () => {
  test("lets the author edit, marks it edited and keeps revisions for moderators", async ({
    app,
    services,
  }) => {
    const author = await signInAs(services)
    const stranger = await signInAs(services)
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const target = { type: "MEDIA", id: await seedMedia(services, author.userId) }
    const comment = await postComment(app, author.headers, target, "first draft")

    expect(comment.editedAt).toBeNull()

    const denied = await api(app, `/comments/${comment.id}`, {
      method: "PATCH",
      headers: stranger.headers,
      json: { content: "hijacked" },
    })

    expect(denied.status).toBe(403)

    const edited = expectSuccess(
      await api<CommentResponse>(app, `/comments/${comment.id}`, {
        method: "PATCH",
        headers: author.headers,
        json: { content: "second draft" },
      }),
    )

    expect(edited.content).toBe("second draft")
    expect(edited.editedAt).not.toBeNull()

    const forbidden = await api(app, `/comments/${comment.id}/revisions`, {
      headers: author.headers,
    })

    expect(forbidden.status).toBe(403)

    const revisions = expectSuccess(
      await api<{ current: { content: string }; revisions: Array<{ content: string }> }>(
        app,
        `/comments/${comment.id}/revisions`,
        { headers: moderator.headers },
      ),
    )

    expect(revisions.current.content).toBe("second draft")
    expect(revisions.revisions.map((revision) => revision.content)).toEqual(["first draft"])
  })

  test("rejects empty, overlong and image-stuffed comments", async ({ app, services }) => {
    const user = await signInAs(services)
    const target = { type: "MEDIA", id: await seedMedia(services, user.userId) }
    const send = (content: string) =>
      api(app, "/comments", {
        method: "POST",
        headers: user.headers,
        json: { targetType: target.type, targetId: target.id, content },
      })

    expect((await send("   ​\n ")).body).toMatchObject({ code: "COMMENT_EMPTY" })
    expect((await send("a".repeat(2001))).body).toMatchObject({ code: "COMMENT_TOO_LONG" })
    expect(
      (await send(Array.from({ length: 5 }, () => `![](image:${crypto.randomUUID()})`).join("\n")))
        .body,
    ).toMatchObject({ code: "COMMENT_TOO_MANY_IMAGES" })
    expect((await send(`![](image:${crypto.randomUUID()})`)).body).toMatchObject({
      code: "COMMENT_IMAGE_UNAVAILABLE",
    })
  })
})

describe("deleting", () => {
  test("keeps a placeholder while replies exist and drops it afterwards", async ({
    app,
    services,
  }) => {
    const author = await signInAs(services)
    const replier = await signInAs(services)
    const target = { type: "MEDIA", id: await seedMedia(services, author.userId) }
    const root = await postComment(app, author.headers, target, "root")
    const reply = await postReply(app, replier.headers, root.id)
    const lonely = await postComment(app, author.headers, target, "lonely")

    await api(app, `/comments/${root.id}`, { method: "DELETE", headers: author.headers })
    await api(app, `/comments/${lonely.id}`, { method: "DELETE", headers: author.headers })

    const afterRoot = await listComments(app, target)

    expect(afterRoot.data).toHaveLength(1)
    expect(afterRoot.data[0]).toMatchObject({
      id: root.id,
      removal: "AUTHOR",
      content: null,
      author: null,
      replyCount: 1,
    })
    expect(afterRoot.meta.total).toBe(1)

    await api(app, `/comments/${reply.id}`, { method: "DELETE", headers: replier.headers })

    expect((await listComments(app, target)).data).toEqual([])
  })

  test("says who removed it: profile owner or moderator, and forbids strangers", async ({
    app,
    services,
  }) => {
    const owner = await signInAs(services)
    const author = await signInAs(services)
    const stranger = await signInAs(services)
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const target = { type: "USER", id: owner.userId }
    const byOwner = await postComment(app, author.headers, target, "one")
    const byModerator = await postComment(app, author.headers, target, "two")

    for (const id of [byOwner.id, byModerator.id]) {
      await postReply(app, stranger.headers, id)
    }

    const denied = await api(app, `/comments/${byOwner.id}`, {
      method: "DELETE",
      headers: stranger.headers,
    })

    expect(denied.status).toBe(403)

    const ownerDelete = expectSuccess(
      await api<{ deletion: string }>(app, `/comments/${byOwner.id}`, {
        method: "DELETE",
        headers: owner.headers,
      }),
    )
    const moderatorDelete = expectSuccess(
      await api<{ deletion: string }>(app, `/comments/${byModerator.id}`, {
        method: "DELETE",
        headers: moderator.headers,
      }),
    )

    expect([ownerDelete.deletion, moderatorDelete.deletion]).toEqual(["PAGE_OWNER", "MODERATOR"])

    const again = await api(app, `/comments/${byOwner.id}`, {
      method: "DELETE",
      headers: owner.headers,
    })

    expect(again.status).toBe(404)

    const { data } = await listComments(app, target)

    expect(Object.fromEntries(data.map((comment) => [comment.id, comment.removal]))).toEqual({
      [byOwner.id]: "PAGE_OWNER",
      [byModerator.id]: "MODERATOR",
    })
  })

  test("refuses edits, votes and replies on removed comments", async ({ app, services }) => {
    const author = await signInAs(services)
    const other = await signInAs(services)
    const target = { type: "MEDIA", id: await seedMedia(services, author.userId) }
    const comment = await postComment(app, author.headers, target)

    await api(app, `/comments/${comment.id}`, { method: "DELETE", headers: author.headers })

    const edit = await api(app, `/comments/${comment.id}`, {
      method: "PATCH",
      headers: author.headers,
      json: { content: "back" },
    })
    const vote = await api(app, `/comments/${comment.id}/vote`, {
      method: "PUT",
      headers: other.headers,
    })
    const reply = await api(app, `/comments/${comment.id}/replies`, {
      method: "POST",
      headers: other.headers,
      json: { content: "hello?" },
    })

    expect([edit.status, vote.status, reply.status]).toEqual([404, 404, 404])
  })
})

describe("votes", () => {
  test("counts each voter once and refuses self-votes", async ({ app, services }) => {
    const author = await signInAs(services)
    const voter = await signInAs(services)
    const target = { type: "MEDIA", id: await seedMedia(services, author.userId) }
    const comment = await postComment(app, author.headers, target)
    const vote = () =>
      api<{ upvoteCount: number }>(app, `/comments/${comment.id}/vote`, {
        method: "PUT",
        headers: voter.headers,
      })

    expect(expectSuccess(await vote()).upvoteCount).toBe(1)
    expect(expectSuccess(await vote()).upvoteCount).toBe(1)

    const self = await api(app, `/comments/${comment.id}/vote`, {
      method: "PUT",
      headers: author.headers,
    })

    expect(self.body).toMatchObject({ code: "COMMENT_SELF_VOTE" })

    const { data } = await listComments(app, target, { headers: voter.headers })

    expect(data[0]).toMatchObject({ upvoteCount: 1, viewerVoted: true })

    const removed = expectSuccess(
      await api<{ upvoteCount: number }>(app, `/comments/${comment.id}/vote`, {
        method: "DELETE",
        headers: voter.headers,
      }),
    )

    expect(removed.upvoteCount).toBe(0)
  })
})

describe("moderation edges", () => {
  test("hides banned authors and blocks banned users from posting", async ({ app, services }) => {
    const author = await signInAs(services)
    const banned = await signInAs(services, { banned: true })
    const target = { type: "MEDIA", id: await seedMedia(services, author.userId) }
    const comment = await postComment(app, author.headers, target)
    const denied = await api(app, "/comments", {
      method: "POST",
      headers: banned.headers,
      json: { targetType: target.type, targetId: target.id, content: "hi" },
    })

    expect(denied.status).toBe(403)

    await services.db
      .updateTable("users")
      .set({ banned: true })
      .where("id", "=", author.userId)
      .execute()

    const { data, meta } = await listComments(app, target)

    expect(data.map((item) => item.id)).not.toContain(comment.id)
    expect(meta.total).toBe(0)
  })

  test("returns a reply in context for permalinks", async ({ app, services }) => {
    const user = await signInAs(services)
    const target = { type: "GROUP", id: await seedGroup(services, user.userId, "Linkers") }
    const root = await postComment(app, user.headers, target)

    await postReply(app, user.headers, root.id, "first")

    const linked = await postReply(app, user.headers, root.id, "linked")
    const context = expectSuccess(
      await api<{ target: { type: string; id: string }; comment: RootComment }>(
        app,
        `/comments/${linked.id}/context`,
      ),
    )

    expect(context.target).toEqual(target)
    expect(context.comment.id).toBe(root.id)
    expect(context.comment.replies.map((reply) => reply.id)).toEqual([linked.id])
  })
})
