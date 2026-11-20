import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { randomUUID } from "node:crypto"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import type { ApiResult } from "../helpers/request"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedChapter, seedGroup, seedMedia, seedTitle } from "../helpers/seed"
import { test } from "../setup"

type MergeResult = {
  id: string
  mergedMediaIds: string[]
  movedChapters: number
  foldedChapters: number
}

const expectFailure = (res: ApiResult, status: number, code: string) => {
  expect(res.status).toBe(status)

  if (res.body.success) {
    throw new Error("Expected failure")
  }

  expect(res.body.code).toBe(code)
}
const getPageKey = (mediaId: string, chapterId: string, pageId: string) =>
  `medias/${mediaId}/chapters/${chapterId}/${pageId}.jpg`
const hasObject = async (services: Services, key: string) => {
  try {
    await services.s3.send(new HeadObjectCommand({ Bucket: services.s3Bucket, Key: key }))

    return true
  } catch {
    return false
  }
}
const merge = (
  app: Parameters<typeof api>[0],
  headers: Record<string, string>,
  id: string,
  mediaIds: string[],
) => api<MergeResult>(app, `/medias/${id}/merge`, { method: "POST", headers, json: { mediaIds } })

describe("POST /medias/:id/merge", () => {
  test("moves the duplicate's chapters, readers and details to the media", async ({
    app,
    services,
  }) => {
    const { db } = services
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const reader = await signInAs(services)
    const other = await signInAs(services)
    const mediaId = await seedMedia(services, userId)
    const duplicateId = await seedMedia(services, userId)
    const groupId = await seedGroup(services, userId, "Maid Scan")
    const keptPages = [{ id: randomUUID() }, { id: randomUUID() }]
    const foldedPages = [{ id: randomUUID() }, { id: randomUUID() }]
    const movedPage = { id: randomUUID() }
    const kept = await seedChapter(services, {
      mediaId,
      uploaderId: userId,
      number: 1,
      groupIds: [groupId],
      pages: keptPages,
    })
    const folded = await seedChapter(services, {
      mediaId: duplicateId,
      uploaderId: userId,
      number: 1,
      groupIds: [groupId],
      pages: foldedPages,
    })
    const moved = await seedChapter(services, {
      mediaId: duplicateId,
      uploaderId: userId,
      number: 2,
      groupIds: [groupId],
      pages: [movedPage],
    })
    const longAgo = new Date("2025-01-01T00:00:00.000Z")
    const lastMonth = new Date("2026-10-01T00:00:00.000Z")

    await seedTitle(services, {
      mediaId,
      creatorId: userId,
      title: "Dokgo Rewind",
      isMainTitle: true,
    })
    await seedTitle(services, {
      mediaId: duplicateId,
      creatorId: userId,
      title: "dokgo rewind",
      isMainTitle: true,
    })
    await seedTitle(services, {
      mediaId: duplicateId,
      creatorId: userId,
      title: "독고 리와인드",
      language: "ko",
    })
    await db
      .updateTable("medias")
      .set({ links: { mangaDex: "5744351d-5336-437b-a90b-73514ce21346" } })
      .where("id", "=", mediaId)
      .execute()
    await db
      .updateTable("medias")
      .set({ links: { mangaDex: "5744351d-5336-437b-a90b-73514ce21346", anilist: 159441 } })
      .where("id", "=", duplicateId)
      .execute()
    await db
      .insertInto("userHistories")
      .values([
        {
          userId: reader.userId,
          chapterId: kept,
          pageId: keptPages[0]?.id ?? null,
          createdAt: longAgo,
          updatedAt: longAgo,
        },
        {
          userId: reader.userId,
          chapterId: folded,
          pageId: foldedPages[1]?.id ?? null,
          completed: true,
          createdAt: lastMonth,
          updatedAt: lastMonth,
        },
        {
          userId: other.userId,
          chapterId: moved,
          pageId: movedPage.id,
          createdAt: lastMonth,
          updatedAt: lastMonth,
        },
      ])
      .execute()
    await db
      .insertInto("userLibraryEntries")
      .values([
        { userId: reader.userId, mediaId, status: "READING", updatedAt: longAgo },
        {
          userId: reader.userId,
          mediaId: duplicateId,
          status: "COMPLETED",
          notify: true,
          updatedAt: lastMonth,
        },
        {
          userId: other.userId,
          mediaId: duplicateId,
          status: "PLAN_TO_READ",
          updatedAt: lastMonth,
        },
      ])
      .execute()
    await db
      .insertInto("pageBookmarks")
      .values({ userId: other.userId, chapterId: folded, pageId: foldedPages[0]?.id ?? "" })
      .execute()

    const thread = await db
      .insertInto("commentThreads")
      .values({ mediaId: duplicateId })
      .returning("id")
      .executeTakeFirstOrThrow()

    await db
      .insertInto("comments")
      .values({ threadId: thread.id, authorId: other.userId, content: "Finally on Taiyō" })
      .execute()
    await services.s3.send(
      new PutObjectCommand({
        Bucket: services.s3Bucket,
        Key: getPageKey(duplicateId, moved, movedPage.id),
        Body: "page",
      }),
    )

    const res = await merge(app, headers, mediaId, [duplicateId])

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toEqual({
      id: mediaId,
      mergedMediaIds: [duplicateId],
      movedChapters: 1,
      foldedChapters: 1,
    })

    const medias = await db
      .selectFrom("medias")
      .select(["id", "deletedAt", "deleterId", "links"])
      .where("id", "in", [mediaId, duplicateId])
      .execute()

    expect(medias.find((row) => row.id === mediaId)).toMatchObject({
      deletedAt: null,
      links: { mangaDex: "5744351d-5336-437b-a90b-73514ce21346", anilist: 159441 },
    })
    expect(medias.find((row) => row.id === duplicateId)).toMatchObject({
      deleterId: userId,
      links: {},
    })

    const titles = await db
      .selectFrom("titles")
      .select(["title", "language", "isMainTitle"])
      .where("mediaId", "=", mediaId)
      .where("deletedAt", "is", null)
      .orderBy("isMainTitle", "desc")
      .execute()

    expect(titles).toEqual([
      { title: "Dokgo Rewind", language: "en", isMainTitle: true },
      { title: "독고 리와인드", language: "ko", isMainTitle: false },
    ])

    const chapters = await db
      .selectFrom("chapters")
      .select(["id", "mediaId", "deletedAt"])
      .where("id", "in", [kept, folded, moved])
      .execute()

    expect(chapters.find((row) => row.id === moved)).toMatchObject({ mediaId, deletedAt: null })
    expect(chapters.find((row) => row.id === folded)?.deletedAt).not.toBeNull()

    const histories = await db
      .selectFrom("userHistories")
      .selectAll()
      .where("userId", "in", [reader.userId, other.userId])
      .orderBy("userId")
      .execute()

    expect(histories).toHaveLength(2)
    expect(histories.find((row) => row.userId === reader.userId)).toMatchObject({
      chapterId: kept,
      pageId: keptPages[1]?.id,
      completed: true,
      createdAt: longAgo,
      updatedAt: lastMonth,
    })
    expect(histories.find((row) => row.userId === other.userId)).toMatchObject({
      chapterId: moved,
      updatedAt: lastMonth,
    })

    const library = await db
      .selectFrom("userLibraryEntries")
      .selectAll()
      .where("userId", "in", [reader.userId, other.userId])
      .execute()

    expect(library).toHaveLength(2)
    expect(library.find((row) => row.userId === reader.userId)).toMatchObject({
      mediaId,
      status: "COMPLETED",
      notify: true,
      updatedAt: lastMonth,
    })
    expect(library.find((row) => row.userId === other.userId)).toMatchObject({
      mediaId,
      status: "PLAN_TO_READ",
    })

    const bookmark = await db
      .selectFrom("pageBookmarks")
      .select(["chapterId", "pageId"])
      .where("userId", "=", other.userId)
      .executeTakeFirstOrThrow()

    expect(bookmark).toEqual({ chapterId: kept, pageId: keptPages[0]?.id })

    const threads = await db
      .selectFrom("commentThreads")
      .select("mediaId")
      .where("id", "=", thread.id)
      .executeTakeFirstOrThrow()

    expect(threads.mediaId).toBe(mediaId)
    expect(await hasObject(services, getPageKey(mediaId, moved, movedPage.id))).toBe(true)
    expect(await hasObject(services, getPageKey(duplicateId, moved, movedPage.id))).toBe(false)

    const [log] = await findAuditLogs(services, "media.MERGE")

    expect(log?.targetId).toBe(mediaId)
  })

  test("gives a release only the duplicates have to the media once", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const mediaId = await seedMedia(services, userId)
    const first = await seedMedia(services, userId)
    const second = await seedMedia(services, userId)
    const taken = await seedChapter(services, { mediaId: first, uploaderId: userId, number: 3 })
    const copy = await seedChapter(services, { mediaId: second, uploaderId: userId, number: 3 })
    const res = await merge(app, headers, mediaId, [first, second])

    expect(res.status).toBe(201)

    const chapters = await services.db
      .selectFrom("chapters")
      .select(["id", "mediaId", "deletedAt"])
      .where("id", "in", [taken, copy])
      .execute()

    expect(chapters.find((row) => row.id === taken)).toMatchObject({ mediaId, deletedAt: null })
    expect(chapters.find((row) => row.id === copy)?.deletedAt).not.toBeNull()
  })

  test("folds a copy with credit pages more into the media's copy", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const reader = await signInAs(services)
    const mediaId = await seedMedia(services, userId)
    const duplicateId = await seedMedia(services, userId)
    const keptPages = [{ id: randomUUID() }, { id: randomUUID() }]
    const longerPages = [{ id: randomUUID() }, { id: randomUUID() }, { id: randomUUID() }]
    const kept = await seedChapter(services, {
      mediaId,
      uploaderId: userId,
      number: 124,
      pages: keptPages,
    })
    const longer = await seedChapter(services, {
      mediaId: duplicateId,
      uploaderId: userId,
      number: 124,
      pages: longerPages,
    })

    await services.db
      .insertInto("pageBookmarks")
      .values([
        { userId: reader.userId, chapterId: longer, pageId: longerPages[1]?.id ?? "" },
        { userId: reader.userId, chapterId: longer, pageId: longerPages[2]?.id ?? "" },
      ])
      .execute()

    const res = await merge(app, headers, mediaId, [duplicateId])

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
    }

    expect(res.body.data).toMatchObject({ movedChapters: 0, foldedChapters: 1 })

    const bookmarks = await services.db
      .selectFrom("pageBookmarks")
      .select(["chapterId", "pageId"])
      .where("userId", "=", reader.userId)
      .orderBy("createdAt")
      .execute()

    expect(bookmarks).toEqual(
      expect.arrayContaining([
        { chapterId: kept, pageId: keptPages[1]?.id },
        { chapterId: kept, pageId: longerPages[2]?.id },
      ]),
    )
  })

  test("rejects unauthenticated requests with UNAUTHORIZED", async ({ app }) => {
    const res = await api(app, `/medias/${randomUUID()}/merge`, {
      method: "POST",
      json: { mediaIds: [randomUUID()] },
    })

    expectFailure(res, 401, "UNAUTHORIZED")
  })

  test("rejects banned users with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN", banned: true })

    expectFailure(await merge(app, headers, randomUUID(), [randomUUID()]), 403, "FORBIDDEN")
  })

  test("rejects uploaders with FORBIDDEN", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "UPLOADER" })

    expectFailure(await merge(app, headers, randomUUID(), [randomUUID()]), 403, "FORBIDDEN")
  })

  test("rejects an empty list with VALIDATION_ERROR", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const mediaId = await seedMedia(services, userId)

    expectFailure(await merge(app, headers, mediaId, []), 422, "VALIDATION_ERROR")
  })

  test("rejects merging a media into itself with MEDIA_MERGE_INTO_ITSELF", async ({
    app,
    services,
  }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const mediaId = await seedMedia(services, userId)

    expectFailure(await merge(app, headers, mediaId, [mediaId]), 422, "MEDIA_MERGE_INTO_ITSELF")
  })

  test("rejects a missing duplicate with MEDIA_NOT_FOUND", async ({ app, services }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const mediaId = await seedMedia(services, userId)

    expectFailure(await merge(app, headers, mediaId, [randomUUID()]), 404, "MEDIA_NOT_FOUND")
  })

  test("rejects a duplicate with another flag with MEDIA_FLAG_MISMATCH", async ({
    app,
    services,
  }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const mediaId = await seedMedia(services, userId)
    const duplicateId = await seedMedia(services, userId)

    await services.db
      .updateTable("medias")
      .set({ flag: "STAFF_ONLY" })
      .where("id", "=", duplicateId)
      .execute()

    expectFailure(await merge(app, headers, mediaId, [duplicateId]), 409, "MEDIA_FLAG_MISMATCH")
  })

  test("rejects a link another media has with MEDIA_LINK_CONFLICT and changes nothing", async ({
    app,
    services,
  }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const mediaId = await seedMedia(services, userId)
    const duplicateId = await seedMedia(services, userId)
    const holderId = await seedMedia(services, userId)

    await services.db
      .updateTable("medias")
      .set({ links: { anilist: 105953 } })
      .where("id", "in", [duplicateId, holderId])
      .execute()

    expectFailure(await merge(app, headers, mediaId, [duplicateId]), 409, "MEDIA_LINK_CONFLICT")

    const duplicate = await services.db
      .selectFrom("medias")
      .select(["links", "deletedAt"])
      .where("id", "=", duplicateId)
      .executeTakeFirstOrThrow()

    expect(duplicate).toEqual({ links: { anilist: 105953 }, deletedAt: null })
  })

  test("rejects a duplicate being synced from MangaDex with MEDIA_MERGE_BUSY", async ({
    app,
    services,
  }) => {
    const { headers, userId } = await signInAs(services, { role: "ADMIN" })
    const mediaId = await seedMedia(services, userId)
    const duplicateId = await seedMedia(services, userId)

    await services.db
      .insertInto("mangaDexSyncs")
      .values({
        mediaId: duplicateId,
        userId,
        mangaDexId: "f050074b-318b-4b75-9ce9-0844a9a73567",
        status: "RUNNING",
      })
      .execute()

    expectFailure(await merge(app, headers, mediaId, [duplicateId]), 409, "MEDIA_MERGE_BUSY")
  })
})
