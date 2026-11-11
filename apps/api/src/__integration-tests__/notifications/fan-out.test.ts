import type { UserLibraryStatus } from "@taiyomoe/db"
import { drainNotificationOutbox } from "@taiyomoe/queue"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { signInAs } from "../helpers/auth"
import { seedChapter, seedGroup, seedMedia } from "../helpers/seed"
import { test } from "../setup"
import { readNotificationOutbox, readNotifiedUsers, setupMedia } from "./helpers"

const addToLibrary = async (
  { db }: Services,
  userId: string,
  mediaId: string,
  { status = "READING", notify = true }: { status?: UserLibraryStatus; notify?: boolean } = {},
) => {
  await db.insertInto("userLibraryEntries").values({ userId, mediaId, status, notify }).execute()
}
const followGroup = async ({ db }: Services, userId: string, groupId: string) => {
  await db.insertInto("groupFollows").values({ userId, groupId }).execute()
}

describe("drainNotificationOutbox", () => {
  test("notifies library readers and group followers once each", async ({ services }) => {
    const { uploader, mediaId } = await setupMedia(services)
    const groupId = await seedGroup(services, uploader.userId, "Sunray Scans")
    const reader = await signInAs(services)
    const planner = await signInAs(services)
    const follower = await signInAs(services)
    const both = await signInAs(services)

    await addToLibrary(services, reader.userId, mediaId)
    await addToLibrary(services, planner.userId, mediaId, { status: "PLAN_TO_READ" })
    await addToLibrary(services, both.userId, mediaId)
    await followGroup(services, follower.userId, groupId)
    await followGroup(services, both.userId, groupId)

    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: uploader.userId,
      number: 1,
      status: "PUBLISHED",
      groupIds: [groupId],
    })

    expect(await drainNotificationOutbox(services)).toEqual({ chapters: 1, notifications: 4 })
    expect(await readNotifiedUsers(services, chapterId)).toEqual(
      [reader.userId, planner.userId, follower.userId, both.userId].sort(),
    )
    expect(await readNotificationOutbox(services)).toEqual([])
  })

  test("skips the uploader, muted entries and dropped or completed medias", async ({
    services,
  }) => {
    const { uploader, mediaId } = await setupMedia(services)
    const muted = await signInAs(services)
    const dropped = await signInAs(services)
    const completed = await signInAs(services)

    await addToLibrary(services, uploader.userId, mediaId)
    await addToLibrary(services, muted.userId, mediaId, { notify: false })
    await addToLibrary(services, dropped.userId, mediaId, { status: "DROPPED" })
    await addToLibrary(services, completed.userId, mediaId, { status: "COMPLETED" })

    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: uploader.userId,
      number: 1,
      status: "PUBLISHED",
    })

    expect(await drainNotificationOutbox(services)).toEqual({ chapters: 1, notifications: 0 })
    expect(await readNotifiedUsers(services, chapterId)).toEqual([])
  })

  test("follows each reader's content rating settings", async ({ services }) => {
    const uploader = await signInAs(services, { role: "ADMIN" })
    const mediaId = await seedMedia(services, uploader.userId, "NSFW")
    const cautious = await signInAs(services)
    const adult = await signInAs(services)

    await services.db
      .updateTable("users")
      .set({ settings: { contentRating: ["NORMAL", "SUGGESTIVE", "NSFW"] } })
      .where("id", "=", adult.userId)
      .execute()
    await addToLibrary(services, cautious.userId, mediaId)
    await addToLibrary(services, adult.userId, mediaId)
    await services.db.deleteFrom("notificationOutbox").execute()

    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: uploader.userId,
      number: 1,
      status: "PUBLISHED",
    })

    await drainNotificationOutbox(services)

    expect(await readNotifiedUsers(services, chapterId)).toEqual([adult.userId])
  })

  test("ignores chapters released long ago", async ({ services }) => {
    const { uploader, mediaId } = await setupMedia(services)
    const reader = await signInAs(services)

    await addToLibrary(services, reader.userId, mediaId)

    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: uploader.userId,
      number: 1,
      status: "PUBLISHED",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    })

    await drainNotificationOutbox(services)

    expect(await readNotifiedUsers(services, chapterId)).toEqual([])
  })

  test("ignores chapters removed before the drain", async ({ services }) => {
    const { uploader, mediaId } = await setupMedia(services)
    const reader = await signInAs(services)

    await addToLibrary(services, reader.userId, mediaId)

    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: uploader.userId,
      number: 1,
      status: "PUBLISHED",
    })

    await services.db
      .updateTable("chapters")
      .set({ deletedAt: new Date() })
      .where("id", "=", chapterId)
      .execute()

    expect(await drainNotificationOutbox(services)).toEqual({ chapters: 1, notifications: 0 })
    expect(await readNotificationOutbox(services)).toEqual([])
  })

  test("notifies a reader once when a chapter is published again", async ({ services }) => {
    const { uploader, mediaId } = await setupMedia(services)
    const reader = await signInAs(services)

    await addToLibrary(services, reader.userId, mediaId)

    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: uploader.userId,
      number: 1,
      status: "PUBLISHED",
    })

    await drainNotificationOutbox(services)
    await services.db
      .updateTable("chapters")
      .set({ status: "PENDING" })
      .where("id", "=", chapterId)
      .execute()
    await services.db
      .updateTable("chapters")
      .set({ status: "PUBLISHED" })
      .where("id", "=", chapterId)
      .execute()

    expect(await drainNotificationOutbox(services)).toEqual({ chapters: 1, notifications: 0 })
    expect(await readNotifiedUsers(services, chapterId)).toEqual([reader.userId])
  })
})
