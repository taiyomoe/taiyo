import type { Hono } from "hono"
import { ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3"
import { failStaleMangaDexSyncs, runMangaDexSync } from "@taiyomoe/queue"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import type { MangaDexPlan } from "../../utils/mangadex-sync"
import type { FakeMangaDex } from "../helpers/mangadex"
import { defined } from "../helpers/assert"
import { findAuditLogs } from "../helpers/audit"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { seedGroup, seedMedia } from "../helpers/seed"
import { test } from "../setup"

const MANGADEX_ID = "b0b721ff-c388-4486-aa0f-c2b0bb321512"
const CHAPTER_IDS = [
  "d0000000-0000-4000-8000-000000000001",
  "d0000000-0000-4000-8000-000000000002",
  "d0000000-0000-4000-8000-000000000003",
]
const COVER_ID = "c0000000-0000-4000-8000-000000000001"
const setUp = async ({ services, mangaDex }: { services: Services; mangaDex: FakeMangaDex }) => {
  const { headers, userId } = await signInAs(services, { role: "UPLOADER" })
  const mediaId = await seedMedia(services, userId)
  const groupId = await seedGroup(services, userId, "Blue Solo")

  mangaDex.mangas.set(MANGADEX_ID, {
    id: MANGADEX_ID,
    title: { "ja-ro": "Sousou no Frieren" },
    altTitles: [{ en: "Frieren: Beyond Journey's End" }],
    description: { en: "Elf mage." },
    links: { al: "118586" },
    tags: ["Fantasy"],
    staff: [
      {
        id: "22222222-2222-4222-8222-222222222222",
        role: "artist",
        name: "Abe Tsukasa",
        twitter: "https://twitter.com/abe",
      },
    ],
  })
  mangaDex.covers.set(MANGADEX_ID, [{ id: COVER_ID, volume: "1", locale: "ja" }])
  mangaDex.chapters.set(MANGADEX_ID, [
    {
      id: defined(CHAPTER_IDS[0]),
      chapter: "1",
      translatedLanguage: "fr",
      pages: 3,
      publishAt: "2021-04-20T10:00:00+00:00",
      groups: [{ id: "g1", name: "BLUE SOLO" }],
    },
    {
      id: defined(CHAPTER_IDS[1]),
      chapter: "2",
      translatedLanguage: "pt-br",
      title: "A jornada",
      groups: [{ id: "g2", name: "Lua Scans", discord: "abcDEF" }],
    },
    {
      id: defined(CHAPTER_IDS[2]),
      chapter: "3",
      translatedLanguage: "en",
      pages: 0,
      externalUrl: "https://mangaplus.shueisha.co.jp/viewer/1",
    },
  ])

  return { headers, userId, mediaId, groupId }
}
const getPlan = async (
  { app }: { app: Hono },
  mediaId: string,
  headers: Record<string, string>,
  query = "",
) => {
  const res = await api<MangaDexPlan>(app, `/medias/${mediaId}/mangadex-sync${query}`, { headers })

  if (!res.body.success) {
    throw new Error(JSON.stringify(res.body))
  }

  return res.body.data
}
const allKeys = (plan: MangaDexPlan) =>
  [
    ...plan.titles,
    ...plan.synopses,
    ...plan.staff,
    ...plan.tags,
    ...plan.links,
    ...plan.fields,
    ...plan.covers,
    ...plan.chapters,
  ].map((item) => item.key)

describe("POST /medias/:id/mangadex-sync", () => {
  test("adds the metadata, then imports the covers and chapters", async ({
    app,
    services,
    mangaDex,
  }) => {
    const { headers, userId, mediaId, groupId } = await setUp({ services, mangaDex })
    const plan = await getPlan({ app }, mediaId, headers, `?mangaDexId=${MANGADEX_ID}`)
    const res = await api<{
      id: string
      status: string
      queued: { covers: number; chapters: number }
    }>(app, `/medias/${mediaId}/mangadex-sync`, {
      method: "POST",
      headers,
      json: { mangaDexId: MANGADEX_ID, keys: allKeys(plan) },
    })

    expect(res.status).toBe(201)

    if (!res.body.success) {
      throw new Error(JSON.stringify(res.body))
    }

    const syncId = res.body.data.id

    expect(res.body.data).toMatchObject({ status: "PENDING", queued: { covers: 1, chapters: 3 } })
    expect(mangaDex.jobs).toEqual([{ syncId }])

    const media = await services.db
      .selectFrom("medias")
      .select(["links", "synopsis", "tags"])
      .where("id", "=", mediaId)
      .executeTakeFirstOrThrow()
    const titles = await services.db
      .selectFrom("titles")
      .select(["title", "language"])
      .where("mediaId", "=", mediaId)
      .execute()
    const credits = await services.db
      .selectFrom("mediaStaffs")
      .innerJoin("staffs", "staffs.id", "mediaStaffs.staffId")
      .select(["staffs.name", "staffs.links", "mediaStaffs.role"])
      .where("mediaStaffs.mediaId", "=", mediaId)
      .execute()

    expect(media.links).toEqual({ mangaDex: MANGADEX_ID, anilist: 118586 })
    expect(media.synopsis).toEqual({ en: "Elf mage." })
    expect(media.tags).toEqual([{ key: "FANTASY", isSpoiler: false }])
    expect(titles).toHaveLength(2)
    expect(credits).toEqual([
      { name: "Abe Tsukasa", links: { twitter: "https://twitter.com/abe" }, role: "ARTIST" },
    ])
    expect(await findAuditLogs(services, "media.mangadex.START")).toHaveLength(1)

    const processed = await runMangaDexSync(
      { db: services.db, s3: services.s3, s3Bucket: services.s3Bucket, mangaDex: mangaDex.client },
      { syncId },
    )

    expect(processed).toMatchObject({ status: "FINISHED", done: 4 })

    const chapters = await services.db
      .selectFrom("chapters")
      .select([
        "id",
        "number",
        "language",
        "status",
        "isExternal",
        "externalUrl",
        "pages",
        "createdAt",
        "uploaderId",
        "title",
      ])
      .where("mediaId", "=", mediaId)
      .orderBy("number")
      .execute()

    expect(
      chapters.map((c) => [c.number, c.language, c.status, c.isExternal, c.pages?.length ?? null]),
    ).toEqual([
      [1, "fr", "PUBLISHED", false, 3],
      [2, "pt_br", "PUBLISHED", false, 2],
      [3, "en", "PUBLISHED", true, null],
    ])
    expect(chapters[0]?.createdAt.toISOString()).toBe("2021-04-20T10:00:00.000Z")
    expect(chapters[1]?.title).toBe("A jornada")
    expect(chapters.every((chapter) => chapter.uploaderId === userId)).toBe(true)

    const credited = await services.db
      .selectFrom("chapterGroups")
      .innerJoin("groups", "groups.id", "chapterGroups.groupId")
      .select(["chapterGroups.chapterId", "groups.id", "groups.name", "groups.discord"])
      .where(
        "chapterGroups.chapterId",
        "in",
        chapters.map((chapter) => chapter.id),
      )
      .execute()

    expect(credited.find((row) => row.chapterId === chapters[0]?.id)?.id).toBe(groupId)
    expect(credited.find((row) => row.chapterId === chapters[1]?.id)).toMatchObject({
      name: "Lua Scans",
      discord: "https://discord.gg/abcDEF",
    })

    const owners = await services.db
      .selectFrom("groupMemberships")
      .select("userId")
      .where("groupId", "=", defined(credited.find((row) => row.name === "Lua Scans")).id)
      .execute()

    expect(owners).toEqual([])

    const pages = await services.s3.send(
      new ListObjectsV2Command({
        Bucket: services.s3Bucket,
        Prefix: `medias/${mediaId}/chapters/${chapters[0]?.id}/`,
      }),
    )

    expect(pages.Contents).toHaveLength(3)

    const cover = await services.db
      .selectFrom("covers")
      .select(["volume", "language", "isMainCover"])
      .where("mediaId", "=", mediaId)
      .executeTakeFirstOrThrow()

    expect(cover).toEqual({ volume: "1", language: "ja", isMainCover: true })

    const again = await getPlan({ app }, mediaId, headers)

    expect(allKeys(again)).toEqual([])

    const sync = await api<{ status: string; counts: Record<string, number>; items: unknown[] }>(
      app,
      `/mangadex-syncs/${syncId}`,
      { headers },
    )

    expect(sync.body).toMatchObject({
      success: true,
      data: { status: "FINISHED", counts: { done: 4, pending: 0 } },
    })
  }, 60_000)

  test("reports a chapter that fails without stopping the others", async ({
    app,
    services,
    mangaDex,
  }) => {
    const { headers, mediaId } = await setUp({ services, mangaDex })
    const plan = await getPlan({ app }, mediaId, headers, `?mangaDexId=${MANGADEX_ID}`)

    mangaDex.brokenImages.add(`https://uploads.mangadex.org/data/hash/1.png`)

    const res = await api<{ id: string }>(app, `/medias/${mediaId}/mangadex-sync`, {
      method: "POST",
      headers,
      json: {
        mangaDexId: MANGADEX_ID,
        keys: plan.chapters.map((chapter) => chapter.key),
      },
    })
    const syncId = res.body.success ? res.body.data.id : ""

    await runMangaDexSync(
      { db: services.db, s3: services.s3, s3Bucket: services.s3Bucket, mangaDex: mangaDex.client },
      { syncId },
    )

    const items = await services.db
      .selectFrom("mangaDexSyncItems")
      .select(["mangaDexId", "status", "error"])
      .where("syncId", "=", syncId)
      .orderBy("position")
      .execute()

    expect(items.filter((item) => item.status === "FAILED").map((item) => item.error)).toEqual([
      "Page 1: uploads.mangadex.org answered 404",
      "Page 1: uploads.mangadex.org answered 404",
    ])
    expect(items.find((item) => item.mangaDexId === CHAPTER_IDS[2])?.status).toBe("DONE")

    const sync = await services.db
      .selectFrom("mangaDexSyncs")
      .select("status")
      .where("id", "=", syncId)
      .executeTakeFirstOrThrow()

    expect(sync.status).toBe("FINISHED")

    const retry = await getPlan({ app }, mediaId, headers)

    expect(new Set(retry.chapters.map((chapter) => chapter.mangaDexId))).toEqual(
      new Set([CHAPTER_IDS[0], CHAPTER_IDS[1]]),
    )
  }, 60_000)

  test("leaves out a chapter whose link is not http(s) and still imports the others", async ({
    app,
    services,
    mangaDex,
  }) => {
    const { headers, mediaId } = await setUp({ services, mangaDex })

    mangaDex.chapters.set(MANGADEX_ID, [
      {
        id: defined(CHAPTER_IDS[0]),
        chapter: "1",
        translatedLanguage: "fr",
        pages: 0,
        externalUrl: "ftp://example.com/chapter",
      },
      { id: defined(CHAPTER_IDS[1]), chapter: "2", translatedLanguage: "fr", pages: 2 },
    ])

    const plan = await getPlan({ app }, mediaId, headers, `?mangaDexId=${MANGADEX_ID}`)

    expect(plan.chapters.map((chapter) => chapter.mangaDexId)).not.toContain(CHAPTER_IDS[0])

    const res = await api<{ id: string }>(app, `/medias/${mediaId}/mangadex-sync`, {
      method: "POST",
      headers,
      json: {
        mangaDexId: MANGADEX_ID,
        keys: plan.chapters.map((chapter) => chapter.key),
      },
    })
    const syncId = res.body.success ? res.body.data.id : ""

    await runMangaDexSync(
      { db: services.db, s3: services.s3, s3Bucket: services.s3Bucket, mangaDex: mangaDex.client },
      { syncId },
    )

    const items = await services.db
      .selectFrom("mangaDexSyncItems")
      .select(["mangaDexId", "status"])
      .where("syncId", "=", syncId)
      .execute()

    expect(items.find((item) => item.mangaDexId === CHAPTER_IDS[1])?.status).toBe("DONE")
  }, 60_000)

  test("moves to another MangaDex@Home node when one fails", async ({
    app,
    services,
    mangaDex,
  }) => {
    const { headers, mediaId } = await setUp({ services, mangaDex })
    const plan = await getPlan({ app }, mediaId, headers, `?mangaDexId=${MANGADEX_ID}`)
    const chapterId = defined(CHAPTER_IDS[0])

    mangaDex.flakyNodes.add(chapterId)

    const res = await api<{ id: string }>(app, `/medias/${mediaId}/mangadex-sync`, {
      method: "POST",
      headers,
      json: {
        mangaDexId: MANGADEX_ID,
        keys: plan.chapters
          .filter((chapter) => chapter.mangaDexId === chapterId)
          .map((chapter) => chapter.key),
      },
    })
    const syncId = res.body.success ? res.body.data.id : ""

    await runMangaDexSync(
      { db: services.db, s3: services.s3, s3Bucket: services.s3Bucket, mangaDex: mangaDex.client },
      { syncId },
    )

    const item = await services.db
      .selectFrom("mangaDexSyncItems")
      .select(["status", "error"])
      .where("syncId", "=", syncId)
      .executeTakeFirstOrThrow()

    expect(item).toEqual({ status: "DONE", error: null })
    expect(
      mangaDex.requests.filter((path) => path === `/at-home/server/${chapterId}`),
    ).toHaveLength(2)
  }, 60_000)

  test("refuses a locked media, and stops when one gets locked", async ({
    app,
    services,
    mangaDex,
  }) => {
    const { headers, mediaId } = await setUp({ services, mangaDex })
    const plan = await getPlan({ app }, mediaId, headers, `?mangaDexId=${MANGADEX_ID}`)
    const start = () =>
      api<{ id: string }>(app, `/medias/${mediaId}/mangadex-sync`, {
        method: "POST",
        headers,
        json: { mangaDexId: MANGADEX_ID, keys: plan.chapters.map((chapter) => chapter.key) },
      })
    const res = await start()
    const syncId = res.body.success ? res.body.data.id : ""

    await services.db
      .updateTable("medias")
      .set({ flag: "LOCKED" })
      .where("id", "=", mediaId)
      .execute()
    await runMangaDexSync(
      { db: services.db, s3: services.s3, s3Bucket: services.s3Bucket, mangaDex: mangaDex.client },
      { syncId },
    )

    const sync = await services.db
      .selectFrom("mangaDexSyncs")
      .select(["status", "error"])
      .where("id", "=", syncId)
      .executeTakeFirstOrThrow()
    const chapters = await services.db
      .selectFrom("chapters")
      .select("id")
      .where("mediaId", "=", mediaId)
      .execute()

    expect(sync).toEqual({
      status: "FAILED",
      error: "The media was locked following a copyright notice.",
    })
    expect(chapters).toEqual([])

    const locked = await api(app, `/medias/${mediaId}/mangadex-sync`, { headers })
    const refused = await start()

    expect(locked.status).toBe(451)
    expect(locked.body).toMatchObject({ code: "MEDIA_LOCKED" })
    expect(refused.status).toBe(451)
  }, 60_000)

  test("keeps a single sync per media, and cancels", async ({ app, services, mangaDex }) => {
    const { headers, mediaId } = await setUp({ services, mangaDex })
    const plan = await getPlan({ app }, mediaId, headers, `?mangaDexId=${MANGADEX_ID}`)
    const start = () =>
      api<{ id: string }>(app, `/medias/${mediaId}/mangadex-sync`, {
        method: "POST",
        headers,
        json: { mangaDexId: MANGADEX_ID, keys: plan.chapters.map((chapter) => chapter.key) },
      })
    const first = await start()
    const second = await start()

    expect(first.status).toBe(201)
    expect(second.status).toBe(409)
    expect(second.body).toMatchObject({ code: "MANGADEX_SYNC_IN_PROGRESS" })

    const syncId = first.body.success ? first.body.data.id : ""
    const cancel = await api(app, `/mangadex-syncs/${syncId}/cancel`, { method: "POST", headers })

    expect(cancel.status).toBe(201)

    await runMangaDexSync(
      { db: services.db, s3: services.s3, s3Bucket: services.s3Bucket, mangaDex: mangaDex.client },
      { syncId },
    )

    const chapters = await services.db
      .selectFrom("chapters")
      .select("id")
      .where("mediaId", "=", mediaId)
      .execute()

    expect(chapters).toEqual([])

    const list = await api<Array<{ id: string; status: string; counts: { skipped: number } }>>(
      app,
      `/medias/${mediaId}/mangadex-syncs`,
      { headers },
    )

    expect(list.body).toMatchObject({
      success: true,
      data: [{ id: syncId, status: "CANCELLED", counts: { skipped: 3 } }],
    })

    const again = await api(app, `/mangadex-syncs/${syncId}/cancel`, { method: "POST", headers })

    expect(again.status).toBe(409)
  }, 60_000)

  test("finishes at once when only metadata is picked", async ({ app, services, mangaDex }) => {
    const { headers, mediaId } = await setUp({ services, mangaDex })
    const plan = await getPlan({ app }, mediaId, headers, `?mangaDexId=${MANGADEX_ID}`)
    const res = await api<{ status: string; summary: Record<string, number> }>(
      app,
      `/medias/${mediaId}/mangadex-sync`,
      {
        method: "POST",
        headers,
        json: { mangaDexId: MANGADEX_ID, keys: plan.titles.map((title) => title.key) },
      },
    )

    expect(res.body).toMatchObject({
      success: true,
      data: { status: "FINISHED", summary: { titles: 2 } },
    })
    expect(mangaDex.jobs).toEqual([])
  }, 30_000)
})

describe("failStaleMangaDexSyncs", () => {
  const startAndInterrupt = async (
    { app, services, mangaDex }: { app: Hono; services: Services; mangaDex: FakeMangaDex },
    { status, updatedAt }: { status: "PENDING" | "RUNNING"; updatedAt: Date },
  ) => {
    const { headers, mediaId } = await setUp({ services, mangaDex })
    const plan = await getPlan({ app }, mediaId, headers, `?mangaDexId=${MANGADEX_ID}`)
    const res = await api<{ id: string }>(app, `/medias/${mediaId}/mangadex-sync`, {
      method: "POST",
      headers,
      json: { mangaDexId: MANGADEX_ID, keys: allKeys(plan) },
    })

    if (!res.body.success) {
      throw new Error(JSON.stringify(res.body))
    }

    const syncId = res.body.data.id
    const item = await services.db
      .selectFrom("mangaDexSyncItems")
      .select("id")
      .where("syncId", "=", syncId)
      .where("kind", "=", "CHAPTER")
      .orderBy("position")
      .executeTakeFirstOrThrow()
    const entityId = crypto.randomUUID()
    const prefix = `medias/${mediaId}/chapters/${entityId}/`

    await services.db
      .updateTable("mangaDexSyncs")
      .set({ status, updatedAt })
      .where("id", "=", syncId)
      .execute()
    await services.db
      .updateTable("mangaDexSyncItems")
      .set({ entityId })
      .where("id", "=", item.id)
      .execute()
    await services.s3.send(
      new PutObjectCommand({
        Bucket: services.s3Bucket,
        Key: `${prefix}page.jpg`,
        Body: Buffer.from("page"),
      }),
    )

    return { syncId, itemId: item.id, entityId, prefix }
  }
  const listPrefix = (services: Services, prefix: string) =>
    services.s3.send(new ListObjectsV2Command({ Bucket: services.s3Bucket, Prefix: prefix }))
  const getSyncStatus = async (services: Services, syncId: string) =>
    (
      await services.db
        .selectFrom("mangaDexSyncs")
        .select("status")
        .where("id", "=", syncId)
        .executeTakeFirstOrThrow()
    ).status

  test("fails a quiet sync whose job is gone, and deletes its interrupted pages", async ({
    app,
    services,
    mangaDex,
  }) => {
    const { syncId, itemId, prefix } = await startAndInterrupt(
      { app, services, mangaDex },
      { status: "RUNNING", updatedAt: new Date(Date.now() - 3 * 3_600_000) },
    )
    const failed = await failStaleMangaDexSyncs({
      db: services.db,
      s3: services.s3,
      s3Bucket: services.s3Bucket,
      mangaDex: mangaDex.client,
      getJobState: () => Promise.resolve("unknown" as const),
    })

    expect(failed).toHaveLength(1)
    expect(failed[0]).toMatchObject({ id: syncId, jobState: "unknown" })
    expect(await getSyncStatus(services, syncId)).toBe("FAILED")
    expect((await listPrefix(services, prefix)).Contents).toBeUndefined()

    const item = await services.db
      .selectFrom("mangaDexSyncItems")
      .select("entityId")
      .where("id", "=", itemId)
      .executeTakeFirstOrThrow()

    expect(item.entityId).toBeNull()
  }, 60_000)

  test("leaves a quiet sync alone while its job is still alive", async ({
    app,
    services,
    mangaDex,
  }) => {
    const { syncId, prefix } = await startAndInterrupt(
      { app, services, mangaDex },
      { status: "RUNNING", updatedAt: new Date(Date.now() - 3 * 3_600_000) },
    )
    const failed = await failStaleMangaDexSyncs({
      db: services.db,
      s3: services.s3,
      s3Bucket: services.s3Bucket,
      mangaDex: mangaDex.client,
      getJobState: () => Promise.resolve("active" as const),
    })

    expect(failed).toEqual([])
    expect(await getSyncStatus(services, syncId)).toBe("RUNNING")
    expect((await listPrefix(services, prefix)).Contents).toHaveLength(1)
  }, 60_000)

  test("leaves a recently active sync alone", async ({ app, services, mangaDex }) => {
    const { syncId } = await startAndInterrupt(
      { app, services, mangaDex },
      { status: "RUNNING", updatedAt: new Date() },
    )
    const failed = await failStaleMangaDexSyncs({
      db: services.db,
      s3: services.s3,
      s3Bucket: services.s3Bucket,
      mangaDex: mangaDex.client,
      getJobState: () => Promise.resolve("unknown" as const),
    })

    expect(failed).toEqual([])
    expect(await getSyncStatus(services, syncId)).toBe("RUNNING")
  }, 60_000)

  test("a retried import deletes what the interrupted attempt uploaded", async ({
    app,
    services,
    mangaDex,
  }) => {
    const { syncId, itemId, entityId, prefix } = await startAndInterrupt(
      { app, services, mangaDex },
      { status: "PENDING", updatedAt: new Date() },
    )

    await runMangaDexSync(
      { db: services.db, s3: services.s3, s3Bucket: services.s3Bucket, mangaDex: mangaDex.client },
      { syncId },
    )

    expect((await listPrefix(services, prefix)).Contents).toBeUndefined()

    const item = await services.db
      .selectFrom("mangaDexSyncItems")
      .select(["status", "entityId"])
      .where("id", "=", itemId)
      .executeTakeFirstOrThrow()

    expect(item.status).toBe("DONE")
    expect(item.entityId).not.toBeNull()
    expect(item.entityId).not.toBe(entityId)
  }, 60_000)
})
