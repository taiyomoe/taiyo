import type { UserSettings } from "@taiyomoe/db"
import { drainNotificationOutbox, sendPendingPushes } from "@taiyomoe/queue"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { postComment, postReply } from "../comments/helpers"
import { signInAs } from "../helpers/auth"
import { answerPushWith, getSentPushes } from "../helpers/push-sender"
import { seedChapter, seedGroup } from "../helpers/seed"
import { test } from "../setup"
import { setupMedia } from "./helpers"

const addDevice = async ({ db }: Services, userId: string, name: string) => {
  const endpoint = `https://push.example/send/${name}`

  await db
    .insertInto("pushSubscriptions")
    .values({ userId, endpoint, p256dh: "p256dh-key", auth: "auth-secret" })
    .execute()

  return endpoint
}
const setSettings = async ({ db }: Services, userId: string, settings: UserSettings) => {
  await db.updateTable("users").set({ settings }).where("id", "=", userId).execute()
}
const send = (services: Services) =>
  sendPendingPushes({ db: services.db, send: services.pushSender })
const pushedEndpoints = (services: Services) =>
  getSentPushes(services.pushSender).map(({ endpoint }) => endpoint)
const publishChapter = async (services: Services, number = 1) => {
  const { uploader, mediaId } = await setupMedia(services)
  const groupId = await seedGroup(services, uploader.userId, "Sunray Scans")
  const reader = await signInAs(services)
  const chapter = () =>
    seedChapter(services, { mediaId, uploaderId: uploader.userId, number, groupIds: [groupId] })

  return { mediaId, groupId, reader, chapter }
}

describe("sendPendingPushes", () => {
  test("pushes a reply to every device of the comment's author, once", async ({
    app,
    services,
  }) => {
    const { mediaId } = await setupMedia(services)
    const author = await signInAs(services)
    const replier = await signInAs(services)
    const laptop = await addDevice(services, author.userId, "laptop")
    const phone = await addDevice(services, author.userId, "phone")
    const root = await postComment(app, author.headers, { type: "MEDIA", id: mediaId })

    await postReply(app, replier.headers, root.id, "Right? Kyodai nailed it.")

    expect(await send(services)).toMatchObject({ notifications: 1, sent: 2 })
    expect(pushedEndpoints(services).sort()).toEqual([laptop, phone].sort())

    const [{ message } = { message: null }] = getSentPushes(services.pushSender)

    expect(message).toMatchObject({ body: "Right? Kyodai nailed it." })
    expect(message?.url).toMatch(/^\/notifications\/open\?id=[\w-]+&to=%2Fmedia%2F/)
    expect(message?.title).toMatch(/replied to your comment$/)
    expect(await send(services)).toMatchObject({ notifications: 0, sent: 0 })
  })

  test("follows the per-type settings for new chapters", async ({ services }) => {
    const { mediaId, groupId, reader, chapter } = await publishChapter(services)
    const device = await addDevice(services, reader.userId, "reader")

    await services.db
      .insertInto("userLibraryEntries")
      .values({ userId: reader.userId, mediaId, status: "READING" })
      .execute()
    await services.db
      .insertInto("groupFollows")
      .values({ userId: reader.userId, groupId })
      .execute()
    await setSettings(services, reader.userId, { pushLibraryChapters: false })
    await chapter()
    await drainNotificationOutbox(services)

    expect(await send(services)).toMatchObject({ sent: 1 })
    expect(pushedEndpoints(services)).toEqual([device])
    expect(getSentPushes(services.pushSender)[0]?.message).toMatchObject({
      body: "New chapter 1 by Sunray Scans",
    })
  })

  test("pushes nothing for a type the reader turned off", async ({ services }) => {
    const { mediaId, reader, chapter } = await publishChapter(services)

    await addDevice(services, reader.userId, "reader")
    await services.db
      .insertInto("userLibraryEntries")
      .values({ userId: reader.userId, mediaId, status: "READING" })
      .execute()
    await setSettings(services, reader.userId, { pushLibraryChapters: false })
    await chapter()
    await drainNotificationOutbox(services)

    expect(await send(services)).toMatchObject({ notifications: 1, sent: 0 })
    expect(await send(services)).toMatchObject({ notifications: 0 })
  })

  test("skips notifications already read in the app", async ({ app, services }) => {
    const { mediaId } = await setupMedia(services)
    const author = await signInAs(services)
    const replier = await signInAs(services)

    await addDevice(services, author.userId, "laptop")

    const root = await postComment(app, author.headers, { type: "MEDIA", id: mediaId })

    await postReply(app, replier.headers, root.id)
    await services.db
      .updateTable("notifications")
      .set({ readAt: new Date() })
      .where("userId", "=", author.userId)
      .execute()

    expect(await send(services)).toMatchObject({ notifications: 1, sent: 0 })
  })

  test("forgets devices the push service dropped", async ({ app, services }) => {
    const { mediaId } = await setupMedia(services)
    const author = await signInAs(services)
    const replier = await signInAs(services)
    const dropped = await addDevice(services, author.userId, "dropped")
    const root = await postComment(app, author.headers, { type: "MEDIA", id: mediaId })

    answerPushWith(services.pushSender, dropped, 410)
    await postReply(app, replier.headers, root.id)

    expect(await send(services)).toMatchObject({ expired: 1 })

    const left = await services.db
      .selectFrom("pushSubscriptions")
      .select("id")
      .where("userId", "=", author.userId)
      .execute()

    expect(left).toEqual([])
  })

  test("marks notifications pushed without sending when push is off", async ({ app, services }) => {
    const { mediaId } = await setupMedia(services)
    const author = await signInAs(services)
    const replier = await signInAs(services)

    await addDevice(services, author.userId, "laptop")

    const root = await postComment(app, author.headers, { type: "MEDIA", id: mediaId })

    await postReply(app, replier.headers, root.id)

    expect(await sendPendingPushes({ db: services.db, send: null })).toMatchObject({
      notifications: 1,
      sent: 0,
    })
    expect(getSentPushes(services.pushSender)).toEqual([])
  })
})
