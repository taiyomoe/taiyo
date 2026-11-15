import type { Hono } from "hono"
import { sql, type UserSettings } from "@taiyomoe/db"
import { drainNotificationOutbox, sendPendingPushes } from "@taiyomoe/queue"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { expectSuccess, postComment, postReply } from "../comments/helpers"
import { signInAs } from "../helpers/auth"
import { getSentPushes } from "../helpers/push-sender"
import { api } from "../helpers/request"
import { seedChapter } from "../helpers/seed"
import { test } from "../setup"
import { setupMedia } from "./helpers"

type Actors = { count: number; latest: Array<{ id: string }> }
type Notification = {
  id: string
  type: string
  readAt: string | null
  actors?: Actors
  upvoteCount?: number
  comment?: { id: string; target: { title: string | null } }
}
type Headers = Record<string, string>

const list = async (app: Hono, headers: Headers, query = "") =>
  expectSuccess(await api<Notification[]>(app, `/users/me/notifications${query}`, { headers }))
const counts = async (app: Hono, headers: Headers) =>
  expectSuccess(
    await api<{
      total: number
      unread: number
      categories: { chapters: number; replies: number; activity: number }
    }>(app, "/users/me/notifications/counts", { headers }),
  )
const upvote = (app: Hono, headers: Headers, commentId: string, method = "PUT") =>
  api(app, `/comments/${commentId}/vote`, { method, headers })
const follow = (app: Hono, headers: Headers, userId: string, method = "POST") =>
  api(app, `/users/${userId}/follow`, { method, headers })
const readAll = (app: Hono, headers: Headers) =>
  api(app, "/users/me/notifications/read-all", { method: "POST", headers })
const setSettings = async ({ db }: Services, userId: string, settings: UserSettings) => {
  await db.updateTable("users").set({ settings }).where("id", "=", userId).execute()
}
const signInMany = (services: Services, count: number) =>
  Promise.all(Array.from({ length: count }, () => signInAs(services)))
const commentOnMedia = async (app: Hono, services: Services) => {
  const { mediaId } = await setupMedia(services)
  const author = await signInAs(services)
  const comment = await postComment(app, author.headers, { type: "MEDIA", id: mediaId })

  return { author, comment }
}

describe("upvote notifications", () => {
  test("gather the upvotes of a comment into one anonymous notification", async ({
    app,
    services,
  }) => {
    const { author, comment } = await commentOnMedia(app, services)
    const voters = await signInMany(services, 4)

    for (const voter of voters) {
      expect((await upvote(app, voter.headers, comment.id)).status).toBe(200)
    }

    const [notification, ...rest] = await list(app, author.headers)

    expect(rest).toEqual([])
    expect(notification).toMatchObject({
      type: "COMMENT_LIKE",
      readAt: null,
      comment: { id: comment.id },
      upvoteCount: 4,
    })
    expect(JSON.stringify(notification)).not.toContain(voters[0]?.userId)
    expect(await counts(app, author.headers)).toMatchObject({
      unread: 1,
      categories: { chapters: 0, replies: 0, activity: 1 },
    })
  })

  test("count each person once, and leave out those who took their upvote back", async ({
    app,
    services,
  }) => {
    const { author, comment } = await commentOnMedia(app, services)
    const [fickle, steady] = await signInMany(services, 2)

    if (fickle === undefined || steady === undefined) {
      throw new Error("Expected two voters")
    }

    await upvote(app, fickle.headers, comment.id)
    await upvote(app, steady.headers, comment.id)
    await upvote(app, fickle.headers, comment.id, "DELETE")

    expect((await list(app, author.headers))[0]?.upvoteCount).toBe(1)

    await readAll(app, author.headers)
    await upvote(app, fickle.headers, comment.id)

    const [notification, ...rest] = await list(app, author.headers)

    expect(rest).toEqual([])
    expect(notification).toMatchObject({ upvoteCount: 2 })
    expect(notification?.readAt).not.toBeNull()

    await upvote(app, fickle.headers, comment.id, "DELETE")
    await upvote(app, steady.headers, comment.id, "DELETE")

    expect(await list(app, author.headers)).toEqual([])
  })

  test("open a new notification once the previous one is read", async ({ app, services }) => {
    const { author, comment } = await commentOnMedia(app, services)
    const [first, second] = await signInMany(services, 2)

    if (first === undefined || second === undefined) {
      throw new Error("Expected two voters")
    }

    await upvote(app, first.headers, comment.id)
    await readAll(app, author.headers)
    await upvote(app, second.headers, comment.id)

    const notifications = await list(app, author.headers)

    expect(notifications.map(({ readAt, upvoteCount }) => [readAt === null, upvoteCount])).toEqual([
      [true, 1],
      [false, 1],
    ])
  })

  test("follow the author's setting", async ({ app, services }) => {
    const { author, comment } = await commentOnMedia(app, services)
    const voter = await signInAs(services)

    await setSettings(services, author.userId, { notifyLikes: false })
    await upvote(app, voter.headers, comment.id)

    expect(await list(app, author.headers)).toEqual([])
  })
})

describe("follow notifications", () => {
  test("gather a burst of concurrent followers into one notification", async ({
    app,
    services,
  }) => {
    const star = await signInAs(services)
    const fans = await signInMany(services, 30)
    // All at once: concurrent follows must still land in a single notification.
    const results = await Promise.all(fans.map((fan) => follow(app, fan.headers, star.userId)))

    expect(results.every(({ status }) => status < 300)).toBe(true)

    const [notification, ...rest] = await list(app, star.headers)

    expect(rest).toEqual([])
    expect(notification).toMatchObject({ type: "FOLLOW", actors: { count: 30 } })
    expect(notification?.actors?.latest).toHaveLength(3)
  })

  test("never notify twice for someone who unfollows and follows again", async ({
    app,
    services,
  }) => {
    const star = await signInAs(services)
    const fan = await signInAs(services)

    await follow(app, fan.headers, star.userId)
    await readAll(app, star.headers)
    await follow(app, fan.headers, star.userId, "DELETE")

    expect(await list(app, star.headers)).toEqual([])

    await follow(app, fan.headers, star.userId)

    const notifications = await list(app, star.headers)

    expect(notifications).toHaveLength(1)
    expect(notifications[0]?.readAt).not.toBeNull()
  })

  test("follow the followed user's setting", async ({ app, services }) => {
    const star = await signInAs(services)
    const fan = await signInAs(services)

    await setSettings(services, star.userId, { notifyFollows: false })
    await follow(app, fan.headers, star.userId)

    expect(await list(app, star.headers)).toEqual([])
  })
})

describe("notification settings", () => {
  test("skip replies and new chapters the user turned off", async ({ app, services }) => {
    const { uploader, mediaId } = await setupMedia(services)
    const reader = await signInAs(services)
    const replier = await signInAs(services)
    const root = await postComment(app, reader.headers, { type: "MEDIA", id: mediaId })

    await services.db
      .insertInto("userLibraryEntries")
      .values({ userId: reader.userId, mediaId, status: "READING" })
      .execute()
    await setSettings(services, reader.userId, { notifyChapters: false, notifyReplies: false })
    await postReply(app, replier.headers, root.id)
    await seedChapter(services, { mediaId, uploaderId: uploader.userId, number: 1 })
    await drainNotificationOutbox(services)

    expect(await list(app, reader.headers)).toEqual([])
  })
})

describe("managing notifications", () => {
  const setup = async (app: Hono, services: Services) => {
    const { author, comment } = await commentOnMedia(app, services)
    const replier = await signInAs(services)

    await postReply(app, replier.headers, comment.id, "Kyodai nailed it")
    await upvote(app, replier.headers, comment.id)
    await follow(app, replier.headers, author.userId)

    return { author, replier, notifications: await list(app, author.headers) }
  }

  test("mark notifications unread and read again", async ({ app, services }) => {
    const { author, notifications } = await setup(app, services)
    const ids = notifications.map(({ id }) => id)
    const mark = (read: boolean) =>
      api<{ count: number }>(app, "/users/me/notifications", {
        method: "PATCH",
        headers: author.headers,
        json: { ids, read },
      })

    expect(expectSuccess(await mark(true))).toEqual({ count: 3 })
    expect(expectSuccess(await mark(true))).toEqual({ count: 0 })
    expect((await counts(app, author.headers)).unread).toBe(0)
    expect(expectSuccess(await mark(false))).toEqual({ count: 3 })
    expect(await counts(app, author.headers)).toMatchObject({
      total: 3,
      unread: 3,
      categories: { chapters: 0, replies: 1, activity: 2 },
    })
  })

  test("delete only your own notifications", async ({ app, services }) => {
    const { author, replier, notifications } = await setup(app, services)
    const ids = notifications.map(({ id }) => id)
    const remove = (headers: Headers) =>
      api<{ count: number }>(app, "/users/me/notifications", {
        method: "DELETE",
        headers,
        json: { ids },
      })

    expect(expectSuccess(await remove(replier.headers))).toEqual({ count: 0 })
    expect(expectSuccess(await remove(author.headers))).toEqual({ count: 3 })
    expect(await list(app, author.headers)).toEqual([])
  })

  test("filter by kind, unread state and text", async ({ app, services }) => {
    const { author, replier } = await setup(app, services)
    const types = async (query: string) =>
      (await list(app, author.headers, query)).map(({ type }) => type).sort()

    expect(await types("?category=replies")).toEqual(["COMMENT_REPLY"])
    expect(await types("?category=activity")).toEqual(["COMMENT_LIKE", "FOLLOW"])
    expect(await types("?q=kyodai")).toEqual(["COMMENT_REPLY"])
    expect(await types(`?q=${replier.userId.replace(/-/g, "").slice(0, 8)}`)).toEqual([
      "COMMENT_REPLY",
      "FOLLOW",
    ])
    expect(await types("?q=100%25_off")).toEqual([])

    await readAll(app, author.headers)

    expect(await types("?unread=true")).toEqual([])
  })

  test("reject too many ids at once", async ({ app, services }) => {
    const user = await signInAs(services)
    const res = await api(app, "/users/me/notifications", {
      method: "DELETE",
      headers: user.headers,
      json: { ids: Array.from({ length: 101 }, () => crypto.randomUUID()) },
    })

    expect(res.status).toBe(422)
  })
})

describe("activity pushes", () => {
  const addDevice = async ({ db }: Services, userId: string) => {
    await db
      .insertInto("pushSubscriptions")
      .values((eb) => ({
        userId,
        sessionId: eb.selectFrom("sessions").select("id").where("userId", "=", userId).limit(1),
        endpoint: `https://push.example/send/${userId}`,
        p256dh: "k",
        auth: "a",
      }))
      .execute()
  }
  const age = async ({ db }: Services, userId: string, minutes: number) => {
    await db
      .updateTable("notifications")
      .set({ createdAt: sql<Date>`"createdAt" - make_interval(mins => ${minutes})` })
      .where("userId", "=", userId)
      .execute()
  }

  test("wait for a burst of followers to settle, then push it once", async ({ app, services }) => {
    const star = await signInAs(services)
    const fans = await signInMany(services, 3)
    const send = () => sendPendingPushes({ db: services.db, send: services.pushSender })

    await addDevice(services, star.userId)

    for (const fan of fans) {
      await follow(app, fan.headers, star.userId)
    }

    expect(await send()).toMatchObject({ notifications: 0 })

    await age(services, star.userId, 6)

    expect(await send()).toMatchObject({ notifications: 1, sent: 1 })
    expect(getSentPushes(services.pushSender)[0]?.message.title).toMatch(
      / and 2 others started following you$/,
    )

    await follow(app, (await signInAs(services)).headers, star.userId)
    await age(services, star.userId, 6)

    expect(await send()).toMatchObject({ notifications: 0 })
  })

  test("push upvotes as a count, never naming who upvoted", async ({ app, services }) => {
    const { author, comment } = await commentOnMedia(app, services)
    const voters = await signInMany(services, 2)

    await addDevice(services, author.userId)

    for (const voter of voters) {
      await upvote(app, voter.headers, comment.id)
    }

    await age(services, author.userId, 6)

    expect(await sendPendingPushes({ db: services.db, send: services.pushSender })).toMatchObject({
      sent: 1,
    })
    expect(getSentPushes(services.pushSender)[0]?.message).toMatchObject({
      title: "2 readers upvoted your comment",
      icon: null,
    })
  })

  test("push upvotes only when the author wants them", async ({ app, services }) => {
    const { author, comment } = await commentOnMedia(app, services)
    const voter = await signInAs(services)

    await addDevice(services, author.userId)
    await setSettings(services, author.userId, { pushLikes: false })
    await upvote(app, voter.headers, comment.id)
    await age(services, author.userId, 6)

    expect(await sendPendingPushes({ db: services.db, send: services.pushSender })).toMatchObject({
      notifications: 1,
      sent: 0,
    })
  })
})
