import { sql } from "@taiyomoe/db"
import { publishScheduledChapters } from "@taiyomoe/queue"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import { seedChapter } from "../helpers/seed"
import { test } from "../setup"
import { readNotificationOutbox, resetNotificationOutbox, setupMedia } from "./helpers"

describe("notification outbox triggers", () => {
  test("a chapter inserted as published is enqueued", async ({ services }) => {
    const { uploader, mediaId } = await setupMedia(services)
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: uploader.userId,
      number: 1,
      status: "PUBLISHED",
    })

    expect(await readNotificationOutbox(services)).toEqual([chapterId])
  })

  test.for(["PENDING", "SCHEDULED", "UPLOADING"] as const)(
    "a chapter inserted as %s is not enqueued",
    async (status, { services }) => {
      const { uploader, mediaId } = await setupMedia(services)

      await seedChapter(services, { mediaId, uploaderId: uploader.userId, number: 1, status })

      expect(await readNotificationOutbox(services)).toEqual([])
    },
  )

  test("a chapter is enqueued once when it becomes published", async ({ services }) => {
    const { uploader, mediaId } = await setupMedia(services)
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: uploader.userId,
      number: 1,
      status: "PENDING",
    })

    await services.db
      .updateTable("chapters")
      .set({ status: "PUBLISHED" })
      .where("id", "=", chapterId)
      .execute()
    await services.db
      .updateTable("chapters")
      .set({ title: "Renamed", status: "PUBLISHED" })
      .where("id", "=", chapterId)
      .execute()

    expect(await readNotificationOutbox(services)).toEqual([chapterId])
  })

  test("a deleted chapter is not enqueued", async ({ services }) => {
    const { uploader, mediaId } = await setupMedia(services)
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: uploader.userId,
      number: 1,
      status: "PENDING",
    })

    await services.db
      .updateTable("chapters")
      .set({ status: "PUBLISHED", deletedAt: new Date() })
      .where("id", "=", chapterId)
      .execute()

    expect(await readNotificationOutbox(services)).toEqual([])
  })

  test("a scheduled chapter is enqueued when its release comes", async ({ services }) => {
    const { uploader, mediaId } = await setupMedia(services)
    const chapterId = await seedChapter(services, {
      mediaId,
      uploaderId: uploader.userId,
      number: 1,
      status: "SCHEDULED",
      pages: [{ id: randomUUID() }],
      publishInHours: 1,
    })

    await services.db
      .updateTable("chapters")
      .set({ publishAt: sql<Date>`(CURRENT_TIMESTAMP at time zone 'UTC') - interval '1 minute'` })
      .where("id", "=", chapterId)
      .execute()
    await resetNotificationOutbox(services)
    await publishScheduledChapters(services)

    expect(await readNotificationOutbox(services)).toEqual([chapterId])
  })
})
