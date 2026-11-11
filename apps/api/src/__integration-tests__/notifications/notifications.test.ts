import type { Hono } from "hono"
import { drainNotificationOutbox } from "@taiyomoe/queue"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { expectSuccess, postComment, postReply } from "../comments/helpers"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedGroup } from "../helpers/seed"
import { test } from "../setup"
import { setupMedia } from "./helpers"

type Notification = {
  id: string
  type: string
  readAt: string | null
  chapter?: { id: string; mediaId: string; groups: Array<{ name: string }> }
  comment?: {
    id: string
    excerpt: string
    target: { type: string; id: string }
    author: { id: string }
  }
}

const listNotifications = async (app: Hono, headers: Record<string, string>) =>
  expectSuccess(await api<Notification[]>(app, "/users/me/notifications", { headers }))
const countUnread = async (app: Hono, headers: Record<string, string>) =>
  expectSuccess(
    await api<{ count: number }>(app, "/users/me/notifications/unread-count", { headers }),
  ).count

describe("chapter notifications", () => {
  test("list, count and read a new chapter", async ({ app, services }) => {
    const { uploader, mediaId } = await setupMedia(services)
    const groupId = await seedGroup(services, uploader.userId, "Sunray Scans")
    const reader = await signInAs(services)

    await services.db
      .insertInto("userLibraryEntries")
      .values({ userId: reader.userId, mediaId, status: "READING" })
      .execute()

    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: uploader.userId,
      number: 3,
      status: "PUBLISHED",
      groupIds: [groupId],
    })

    await drainNotificationOutbox(services)

    const [notification] = await listNotifications(app, reader.headers)

    expect(notification).toMatchObject({
      type: "CHAPTER_PUBLISHED",
      readAt: null,
      chapter: { id: chapterId, mediaId, groups: [{ name: "Sunray Scans" }] },
    })
    expect(await countUnread(app, reader.headers)).toBe(1)

    const read = await api(app, `/users/me/notifications/${notification?.id}/read`, {
      method: "POST",
      headers: reader.headers,
    })

    expect(read.status).toBe(201)
    expect(await countUnread(app, reader.headers)).toBe(0)

    await services.db
      .updateTable("chapters")
      .set({ deletedAt: new Date() })
      .where("id", "=", chapterId)
      .execute()

    expect(await listNotifications(app, reader.headers)).toEqual([])
  })

  test("read-all marks every unread notification", async ({ app, services }) => {
    const { uploader, mediaId } = await setupMedia(services)
    const reader = await signInAs(services)

    await services.db
      .insertInto("userLibraryEntries")
      .values({ userId: reader.userId, mediaId, status: "READING" })
      .execute()

    for (const number of [1, 2]) {
      await seedChapter(services, { mediaId, uploaderId: uploader.userId, number })
    }

    await drainNotificationOutbox(services)

    expect(await countUnread(app, reader.headers)).toBe(2)

    const res = await api<{ count: number }>(app, "/users/me/notifications/read-all", {
      method: "POST",
      headers: reader.headers,
    })

    expect(expectSuccess(res)).toEqual({ count: 2 })
    expect(await countUnread(app, reader.headers)).toBe(0)
  })

  test("returns NOTIFICATION_NOT_FOUND for someone else's notification", async ({
    app,
    services,
  }) => {
    const { uploader, mediaId } = await setupMedia(services)
    const reader = await signInAs(services)
    const stranger = await signInAs(services)

    await services.db
      .insertInto("userLibraryEntries")
      .values({ userId: reader.userId, mediaId, status: "READING" })
      .execute()
    await seedChapter(services, { mediaId, uploaderId: uploader.userId, number: 1 })
    await drainNotificationOutbox(services)

    const [notification] = await listNotifications(app, reader.headers)

    for (const id of [notification?.id, randomUUID()]) {
      const res = await api(app, `/users/me/notifications/${id}/read`, {
        method: "POST",
        headers: stranger.headers,
      })

      expect(res.status).toBe(404)
      expect(res.body).toMatchObject({ code: "NOTIFICATION_NOT_FOUND" })
    }
  })

  test("rejects unauthenticated requests", async ({ app }) => {
    expect((await api(app, "/users/me/notifications")).status).toBe(401)
    expect((await api(app, "/users/me/notifications/unread-count")).status).toBe(401)
  })
})

describe("reply notifications", () => {
  test("notify the author of the comment answered", async ({ app, services }) => {
    const { mediaId } = await setupMedia(services)
    const author = await signInAs(services)
    const replier = await signInAs(services)
    const third = await signInAs(services)
    const target = { type: "MEDIA", id: mediaId }
    const root = await postComment(app, author.headers, target, "First!")

    await postReply(app, author.headers, root.id, "Replying to myself")

    const reply = await postReply(app, replier.headers, root.id, "Nice take")

    await postReply(app, third.headers, reply.id, "Agreed with the reply")

    const [authorNotification, ...rest] = await listNotifications(app, author.headers)

    expect(rest).toEqual([])
    expect(authorNotification).toMatchObject({
      type: "COMMENT_REPLY",
      comment: { id: reply.id, excerpt: "Nice take", target, author: { id: replier.userId } },
    })

    const replierNotifications = await listNotifications(app, replier.headers)

    expect(replierNotifications).toHaveLength(1)
    expect(replierNotifications[0]).toMatchObject({ comment: { author: { id: third.userId } } })
  })

  test("hide replies that were deleted", async ({ app, services }) => {
    const { mediaId } = await setupMedia(services)
    const author = await signInAs(services)
    const replier = await signInAs(services)
    const root = await postComment(app, author.headers, { type: "MEDIA", id: mediaId })
    const reply = await postReply(app, replier.headers, root.id)

    expect(await countUnread(app, author.headers)).toBe(1)

    await services.db
      .updateTable("comments")
      .set({ deletedAt: new Date(), deletion: "AUTHOR" })
      .where("id", "=", reply.id)
      .execute()

    expect(await countUnread(app, author.headers)).toBe(0)
    expect(await listNotifications(app, author.headers)).toEqual([])
  })
})
