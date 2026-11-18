import type { Hono } from "hono"
import { sendPendingPushes } from "@taiyomoe/queue"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { expectSuccess, postComment } from "../comments/helpers"
import { signInAs } from "../helpers/auth"
import { getSentPushes } from "../helpers/push-sender"
import { api } from "../helpers/request"
import { seedChapter, seedGroup, seedMedia, seedTitle } from "../helpers/seed"
import { test } from "../setup"

type Headers = Record<string, string>
type Report = {
  id: string
  kind: string
  outcome: string
  chapter?: unknown
  comment?: unknown
  group?: unknown
  user?: unknown
}
type Notification = {
  id: string
  type: string
  readAt: string | null
  action?: string
  list?: { id: string; name: string; deleted: boolean }
  fields?: string[]
  report?: Report
}

const ORIGIN = "https://neutral.example"
const AVATAR_URL = new URL("/avatars/old.png", ORIGIN).href
const listNotifications = async (app: Hono, headers: Headers, query = "") =>
  expectSuccess(await api<Notification[]>(app, `/users/me/notifications${query}`, { headers }))
/** The reports behind your notifications, by report ID. */
const listReports = async (app: Hono, headers: Headers) =>
  new Map(
    (await listNotifications(app, headers)).map(({ type, report }) => {
      expect(type).toBe("REPORT_REVIEWED")

      return [report?.id, report]
    }),
  )
const seedList = async ({ db }: Services, userId: string, name = `List ${randomUUID()}`) =>
  (
    await db
      .insertInto("userLists")
      .values({ userId, name, visibility: "PUBLIC" })
      .returning("id")
      .executeTakeFirstOrThrow()
  ).id
const setAvatar = async ({ db }: Services, userId: string) => {
  await db.updateTable("users").set({ image: AVATAR_URL }).where("id", "=", userId).execute()
}
const getHandle = ({ db }: Services, userId: string) =>
  db
    .selectFrom("users")
    .select(["id", "username", "displayUsername"])
    .where("id", "=", userId)
    .executeTakeFirstOrThrow()

describe("list moderation notifications", () => {
  test("tell the owner when staff edit or delete their list, never about their own edits", async ({
    app,
    services,
  }) => {
    const owner = await signInAs(services)
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const listId = await seedList(services, owner.userId)
    const rename = (headers: Headers, name: string) =>
      api(app, `/lists/${listId}`, { method: "PATCH", headers, json: { name } })

    expect((await rename(owner.headers, "Mine")).status).toBe(200)
    expect(await listNotifications(app, owner.headers)).toEqual([])

    expect((await rename(moderator.headers, "Cleaned up")).status).toBe(200)
    // Sending the same name again changes nothing, so it tells nobody.
    expect((await rename(moderator.headers, "Cleaned up")).status).toBe(200)

    const deleted = await api(app, `/lists/${listId}`, {
      method: "DELETE",
      headers: moderator.headers,
    })

    expect(deleted.status).toBe(200)

    const notifications = new Map(
      (await listNotifications(app, owner.headers)).map((notification) => [
        notification.action,
        notification,
      ]),
    )
    const list = { id: listId, name: "Cleaned up", deleted: true }

    expect(notifications.size).toBe(2)
    expect(notifications.get("UPDATED")).toMatchObject({
      type: "LIST_MODERATED",
      readAt: null,
      list,
    })
    expect(notifications.get("DELETED")).toMatchObject({
      type: "LIST_MODERATED",
      readAt: null,
      list,
    })
    expect(await listNotifications(app, moderator.headers)).toEqual([])
  })

  test("tell the owner of each list deleted in bulk, except the caller", async ({
    app,
    services,
  }) => {
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const first = await signInAs(services)
    const second = await signInAs(services)
    const own = await seedList(services, moderator.userId)
    const firstList = await seedList(services, first.userId)
    const secondList = await seedList(services, second.userId)
    const res = await api(app, "/lists", {
      method: "DELETE",
      headers: moderator.headers,
      json: { listIds: [own, firstList, secondList] },
    })

    expect(res.status).toBe(200)
    expect(await listNotifications(app, first.headers)).toMatchObject([
      { type: "LIST_MODERATED", action: "DELETED", list: { id: firstList, deleted: true } },
    ])
    expect(await listNotifications(app, second.headers)).toMatchObject([
      { type: "LIST_MODERATED", action: "DELETED", list: { id: secondList, deleted: true } },
    ])
    expect(await listNotifications(app, moderator.headers)).toEqual([])
  })
})

describe("profile moderation notifications", () => {
  test("tell the user which parts of their profile staff changed", async ({ app, services }) => {
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const user = await signInAs(services)
    const remove = (part: "avatar" | "banner") =>
      api(app, `/users/${user.userId}/${part}`, { method: "DELETE", headers: moderator.headers })

    await setAvatar(services, user.userId)
    await services.db
      .insertInto("userProfiles")
      .values({
        userId: user.userId,
        about: { en: "Rude text" },
        city: "Lisbon",
        banner: `users/${user.userId}/banners/old.webp`,
      })
      .execute()

    const edited = await api(app, `/users/${user.userId}/profile`, {
      method: "PATCH",
      headers: moderator.headers,
      json: { about: { en: "Clean text" }, city: "Lisbon" },
    })

    expect(edited.status).toBe(200)
    expect(await listNotifications(app, user.headers)).toMatchObject([
      { type: "PROFILE_MODERATED", readAt: null, fields: ["about"] },
    ])

    // The second removal finds nothing left to remove, so it tells nobody.
    for (const part of ["avatar", "banner", "avatar", "banner"] as const) {
      expect((await remove(part)).status).toBe(200)
    }

    const fields = (await listNotifications(app, user.headers)).map((notification) => {
      expect(notification.type).toBe("PROFILE_MODERATED")

      return notification.fields?.join() ?? ""
    })

    expect(fields.sort()).toEqual(["about", "avatar", "banner"])
    expect(await listNotifications(app, moderator.headers)).toEqual([])
  })
})

describe("report review notifications", () => {
  test("tell each reporter of a page how their report was closed, never the reviewer", async ({
    app,
    services,
  }) => {
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const first = await signInAs(services)
    const second = await signInAs(services)
    const mediaId = await seedMedia(services, moderator.userId)
    const [brokenPage, blurryPage] = [randomUUID(), randomUUID()]
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: moderator.userId,
      number: 3,
      status: "PUBLISHED",
      pages: [{ id: brokenPage }, { id: blurryPage }],
    })
    const report = async (reporterId: string, pageId: string) =>
      (
        await services.db
          .insertInto("pageReports")
          .values({ reporterId, chapterId, pageId, reason: "BROKEN" })
          .returning("id")
          .executeTakeFirstOrThrow()
      ).id

    await seedTitle(services, {
      mediaId,
      creatorId: moderator.userId,
      title: "Solo Leveling",
      isMainTitle: true,
    })

    const firstBroken = await report(first.userId, brokenPage)
    const secondBroken = await report(second.userId, brokenPage)
    const firstBlurry = await report(first.userId, blurryPage)

    await report(moderator.userId, brokenPage)

    const single = await api(app, `/chapters/page-reports/${firstBroken}`, {
      method: "PATCH",
      headers: moderator.headers,
      json: { status: "RESOLVED" },
    })
    const bulk = await api(app, "/chapters/page-reports", {
      method: "PATCH",
      headers: moderator.headers,
      json: { reportIds: [firstBlurry], status: "DISMISSED" },
    })

    expect([single.status, bulk.status]).toEqual([200, 200])

    const chapter = {
      id: chapterId,
      number: 3,
      mediaId,
      mediaTitle: "Solo Leveling",
      deleted: false,
    }
    const firstReports = await listReports(app, first.headers)
    const secondReports = await listReports(app, second.headers)

    expect(firstReports.size).toBe(2)
    expect(firstReports.get(firstBroken)).toMatchObject({ kind: "PAGE", outcome: "RESOLVED" })
    expect(firstReports.get(firstBlurry)).toMatchObject({
      kind: "PAGE",
      outcome: "DISMISSED",
      chapter,
    })
    expect(secondReports.size).toBe(1)
    expect(secondReports.get(secondBroken)).toMatchObject({
      kind: "PAGE",
      outcome: "RESOLVED",
      chapter,
    })
    expect(await listNotifications(app, moderator.headers)).toEqual([])
  })

  test("tell each reporter of a comment how their report was closed, one notification each", async ({
    app,
    services,
  }) => {
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const author = await signInAs(services)
    const first = await signInAs(services)
    const second = await signInAs(services)
    const target = { type: "MEDIA", id: await seedMedia(services, author.userId) }
    const borderline = await postComment(app, author.headers, target, "Borderline joke")
    const offTopic = await postComment(app, author.headers, target, "Off-topic rant")
    const spam = await postComment(app, author.headers, target, "Actual spam")
    const report = async (commentId: string, headers: Headers) =>
      expectSuccess(
        await api<{ id: string }>(app, `/comments/${commentId}/reports`, {
          method: "POST",
          headers,
          json: { reason: "SPAM" },
        }),
      ).id
    const firstOnBorderline = await report(borderline.id, first.headers)
    const secondOnBorderline = await report(borderline.id, second.headers)
    const secondOnOffTopic = await report(offTopic.id, second.headers)
    const firstOnSpam = await report(spam.id, first.headers)

    await report(borderline.id, moderator.headers)

    const single = await api(app, `/comment-reports/${firstOnBorderline}`, {
      method: "PATCH",
      headers: moderator.headers,
      json: { status: "DISMISSED" },
    })
    const bulk = await api(app, "/comment-reports", {
      method: "PATCH",
      headers: moderator.headers,
      json: { reportIds: [secondOnOffTopic], status: "RESOLVED" },
    })
    // Removing a comment as a moderator resolves its reports.
    const removal = await api(app, `/comments/${spam.id}`, {
      method: "DELETE",
      headers: moderator.headers,
    })

    expect([single.status, bulk.status, removal.status]).toEqual([200, 200, 200])

    const firstReports = await listReports(app, first.headers)
    const secondReports = await listReports(app, second.headers)

    expect(firstReports.size).toBe(2)
    expect(firstReports.get(firstOnBorderline)).toMatchObject({
      kind: "COMMENT",
      outcome: "DISMISSED",
      comment: {
        id: borderline.id,
        excerpt: "Borderline joke",
        deleted: false,
        target: { type: "MEDIA", id: target.id },
      },
    })
    expect(firstReports.get(firstOnSpam)).toMatchObject({
      kind: "COMMENT",
      outcome: "RESOLVED",
      comment: { id: spam.id, excerpt: null, deleted: true },
    })
    expect(secondReports.size).toBe(2)
    expect(secondReports.get(secondOnBorderline)).toMatchObject({ outcome: "DISMISSED" })
    expect(secondReports.get(secondOnOffTopic)).toMatchObject({
      outcome: "RESOLVED",
      comment: { id: offTopic.id, excerpt: "Off-topic rant" },
    })
    expect(await listNotifications(app, moderator.headers)).toEqual([])
    expect(await listNotifications(app, author.headers)).toEqual([])
  })

  test("keep quiet when the profile owner, not the moderation team, removes a reported comment", async ({
    app,
    services,
  }) => {
    const owner = await signInAs(services)
    const author = await signInAs(services)
    const reporter = await signInAs(services)
    const comment = await postComment(
      app,
      author.headers,
      { type: "USER", id: owner.userId },
      "Rude remark",
    )

    expectSuccess(
      await api<{ id: string }>(app, `/comments/${comment.id}/reports`, {
        method: "POST",
        headers: reporter.headers,
        json: { reason: "HARASSMENT" },
      }),
    )

    const removal = await api(app, `/comments/${comment.id}`, {
      method: "DELETE",
      headers: owner.headers,
    })
    const report = await services.db
      .selectFrom("commentReports")
      .select("status")
      .where("commentId", "=", comment.id)
      .executeTakeFirstOrThrow()

    expect(removal.status).toBe(200)
    expect(report.status).toBe("RESOLVED")
    expect(await listNotifications(app, reporter.headers)).toEqual([])
  })

  test("tell the reporter of a group how their report was reviewed", async ({ app, services }) => {
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const reporter = await signInAs(services)
    const sunray = await seedGroup(services, moderator.userId, "Sunray Scans")
    const moonlight = await seedGroup(services, moderator.userId, "Moonlight Scans")
    const report = async (groupId: string, reporterId: string) =>
      (
        await services.db
          .insertInto("groupReports")
          .values({ groupId, reporterId, reason: "IMPERSONATION" })
          .returning("id")
          .executeTakeFirstOrThrow()
      ).id
    const onSunray = await report(sunray, reporter.userId)
    const onMoonlight = await report(moonlight, reporter.userId)
    const own = await report(moonlight, moderator.userId)
    const single = await api(app, `/group-reports/${onSunray}/review`, {
      method: "POST",
      headers: moderator.headers,
      json: { status: "RESOLVED" },
    })
    const bulk = await api(app, "/group-reports/review", {
      method: "POST",
      headers: moderator.headers,
      json: { reportIds: [onMoonlight, own], status: "DISMISSED" },
    })

    expect([single.status, bulk.status]).toEqual([201, 201])

    const reports = await listReports(app, reporter.headers)

    expect(reports.size).toBe(2)
    expect(reports.get(onSunray)).toEqual({
      id: onSunray,
      kind: "GROUP",
      outcome: "RESOLVED",
      group: { id: sunray, name: "Sunray Scans", deleted: false },
    })
    expect(reports.get(onMoonlight)).toEqual({
      id: onMoonlight,
      kind: "GROUP",
      outcome: "DISMISSED",
      group: { id: moonlight, name: "Moonlight Scans", deleted: false },
    })
    expect(await listNotifications(app, moderator.headers)).toEqual([])
  })

  test("tell the reporter of a user how their report was reviewed", async ({ app, services }) => {
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const reporter = await signInAs(services)
    const rude = await signInAs(services)
    const fake = await signInAs(services)
    const report = async (userId: string, reporterId: string) =>
      (
        await services.db
          .insertInto("userReports")
          .values({ userId, reporterId, reason: "INAPPROPRIATE_PROFILE" })
          .returning("id")
          .executeTakeFirstOrThrow()
      ).id
    const onRude = await report(rude.userId, reporter.userId)
    const onFake = await report(fake.userId, reporter.userId)
    const own = await report(fake.userId, moderator.userId)
    const single = await api(app, `/user-reports/${onRude}/review`, {
      method: "POST",
      headers: moderator.headers,
      json: { status: "DISMISSED" },
    })
    const bulk = await api(app, "/user-reports/review", {
      method: "POST",
      headers: moderator.headers,
      json: { reportIds: [onFake, own], status: "RESOLVED" },
    })

    expect([single.status, bulk.status]).toEqual([201, 201])

    const reports = await listReports(app, reporter.headers)

    expect(reports.size).toBe(2)
    expect(reports.get(onRude)).toEqual({
      id: onRude,
      kind: "USER",
      outcome: "DISMISSED",
      user: await getHandle(services, rude.userId),
    })
    expect(reports.get(onFake)).toEqual({
      id: onFake,
      kind: "USER",
      outcome: "RESOLVED",
      user: await getHandle(services, fake.userId),
    })
    expect(await listNotifications(app, moderator.headers)).toEqual([])
    expect(await listNotifications(app, rude.headers)).toEqual([])
  })
})

describe("the moderation category", () => {
  test("count, filter and search moderation notifications", async ({ app, services }) => {
    const owner = await signInAs(services)
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const listId = await seedList(services, owner.userId, "Best shounen")

    await setAvatar(services, owner.userId)
    await api(app, `/lists/${listId}`, {
      method: "PATCH",
      headers: moderator.headers,
      json: { description: "No spoilers here." },
    })
    await api(app, `/users/${owner.userId}/avatar`, {
      method: "DELETE",
      headers: moderator.headers,
    })

    const types = async (query: string) =>
      (await listNotifications(app, owner.headers, query)).map(({ type }) => type).sort()
    const counts = expectSuccess(
      await api<{ unread: number; categories: Record<string, number> }>(
        app,
        "/users/me/notifications/counts",
        { headers: owner.headers },
      ),
    )

    expect(counts).toEqual({
      total: 2,
      unread: 2,
      categories: { chapters: 0, replies: 0, activity: 0, rewards: 0, moderation: 2 },
    })
    expect(await types("?category=moderation")).toEqual(["LIST_MODERATED", "PROFILE_MODERATED"])
    expect(await types("?category=activity")).toEqual([])
    expect(await types("?q=shounen")).toEqual(["LIST_MODERATED"])
  })

  test("push every moderation notice, whatever the push settings", async ({ app, services }) => {
    const owner = await signInAs(services)
    const moderator = await signInAs(services, { role: "MODERATOR" })
    const listId = await seedList(services, owner.userId, "Best shounen")
    const groupId = await seedGroup(services, moderator.userId, "Sunray Scans")
    const { id: reportId } = await services.db
      .insertInto("groupReports")
      .values({ groupId, reporterId: owner.userId, reason: "STOLEN_WORK" })
      .returning("id")
      .executeTakeFirstOrThrow()

    await services.db
      .updateTable("users")
      .set({
        image: AVATAR_URL,
        settings: {
          pushLibraryChapters: false,
          pushGroupChapters: false,
          pushReplies: false,
          pushLikes: false,
          pushFollows: false,
        },
      })
      .where("id", "=", owner.userId)
      .execute()
    await services.db
      .insertInto("pushSubscriptions")
      .values((eb) => ({
        userId: owner.userId,
        sessionId: eb
          .selectFrom("sessions")
          .select("id")
          .where("userId", "=", owner.userId)
          .limit(1),
        endpoint: new URL(`/push/${owner.userId}`, ORIGIN).href,
        p256dh: "p256dh-key",
        auth: "auth-secret",
      }))
      .execute()
    await api(app, `/lists/${listId}`, {
      method: "PATCH",
      headers: moderator.headers,
      json: { description: "No spoilers here." },
    })
    await api(app, `/users/${owner.userId}/avatar`, {
      method: "DELETE",
      headers: moderator.headers,
    })
    await api(app, `/group-reports/${reportId}/review`, {
      method: "POST",
      headers: moderator.headers,
      json: { status: "RESOLVED" },
    })

    expect(await sendPendingPushes({ db: services.db, send: services.pushSender })).toMatchObject({
      notifications: 3,
      sent: 3,
    })

    const { username } = await getHandle(services, owner.userId)
    const pushes = new Map(
      getSentPushes(services.pushSender).map(({ message }) => [message.title, message]),
    )
    const destinationOf = (title: string) =>
      new URL(pushes.get(title)?.url ?? "", ORIGIN).searchParams.get("to")

    expect(pushes.size).toBe(3)
    expect(pushes.get("The moderation team edited your list")).toMatchObject({
      body: "Best shounen",
      icon: null,
    })
    expect(destinationOf("The moderation team edited your list")).toBe(`/lists/${listId}`)
    expect(pushes.get("The moderation team edited your profile")).toMatchObject({
      body: "Removed: avatar",
      icon: null,
    })
    expect(destinationOf("The moderation team edited your profile")).toBe(`/users/${username}`)
    expect(pushes.get("The moderation team resolved your report")).toMatchObject({
      body: "Sunray Scans",
      icon: null,
    })
    expect(destinationOf("The moderation team resolved your report")).toBe(`/groups/${groupId}`)
  })
})
