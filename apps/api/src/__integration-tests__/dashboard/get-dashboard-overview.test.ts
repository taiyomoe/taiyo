import type { Hono } from "hono"
import { MEDIA_TYPES, type RawBuilder, sql } from "@taiyomoe/db"
import { describe, expect } from "vitest"
import type { Services } from "../../services"
import { defined } from "../helpers/assert"
import { signInAs } from "../helpers/auth"
import { api } from "../helpers/request"
import { test } from "../setup"

type Metric = { total: number; previousTotal: number; current: number[]; previous: number[] }

type DashboardOverview = {
  range: string
  unit: string
  timeZone: string
  buckets: string[]
  metrics: Record<
    "reads" | "uniqueReaders" | "libraryAdds" | "chaptersUploaded" | "newAccounts",
    Metric
  >
  readsByLanguage: Array<{ language: string; reads: number }>
  otherLanguageReads: number
  topMedias: Array<{ id: string; title: string | null; coverUrl: string | null; reads: number }>
  readingHours: number[][]
  topUploaders: Array<{
    id: string
    username: string
    displayUsername: string
    image: string | null
    chapters: number
    previousChapters: number
  }>
  catalogMix: Array<{ type: string; count: number }>
  attention: { pendingOwnershipRequests: number; failedUploads: number }
  recentActivity: Array<{
    kind: string
    at: string
    count: number
    actor: { id: string; username: string; displayUsername: string; image: string | null }
    media: { id: string; title: string | null }
  }>
}

const SEEDED_MEDIA_ID = "4e26b80f-6661-4f5f-93b4-6dfed052bbed"
const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const utcMidnight = (daysAgo: number) => Math.floor(Date.now() / DAY) * DAY - daysAgo * DAY
const isoWeekday = (time: number) => (new Date(time).getUTCDay() + 6) % 7
const UTC_BUCKET_STARTS = {
  hour: (now: Date, offset: number) =>
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours() + offset),
  day: (now: Date, offset: number) =>
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offset),
  week: (now: Date, offset: number) =>
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - isoWeekday(now.getTime()) + 7 * offset,
    ),
  month: (now: Date, offset: number) =>
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset, 1),
}
const utcBuckets = (unit: keyof typeof UTC_BUCKET_STARTS, count: number) => {
  const now = new Date()

  return Array.from({ length: count }, (_, index) =>
    new Date(UTC_BUCKET_STARTS[unit](now, index - count + 1)).toISOString(),
  )
}
const dayAt = (daysAgo: number, hours: number) =>
  sql<Date>`date_trunc('day', now()) - make_interval(days => ${daysAgo}) + make_interval(hours => ${hours})`
const signInAndAgeSeeds = async (services: Services) => {
  const { headers } = await signInAs(services, { role: "ADMIN" })

  for (const table of ["users", "medias", "chapters", "covers"] as const) {
    await sql`update ${sql.table(table)} set "createdAt" = '2000-01-01'`.execute(services.db)
  }

  return headers
}
const getOverview = async (app: Hono, headers: Record<string, string>, query = "") => {
  const res = await api<DashboardOverview>(app, `/dashboard/overview?${query}`, { headers })

  expect(res.status).toBe(200)

  if (!res.body.success) {
    throw new Error(`Expected success: ${JSON.stringify(res.body)}`)
  }

  return res.body.data
}
const createReaders = async (services: Services, count: number) => {
  const readers = await Promise.all(Array.from({ length: count }, () => signInAs(services)))

  return readers.map((reader) => reader.userId)
}
const getChapters = (services: Services, count: number) =>
  services.db
    .selectFrom("chapters")
    .select(["id", "mediaId"])
    .where("deletedAt", "is", null)
    .orderBy("id")
    .limit(count)
    .execute()
const withinHour = (share: number) =>
  sql<Date>`date_trunc('hour', now()) + (now() - date_trunc('hour', now())) * ${share}::float8`
const insertChapters = async (
  services: Services,
  uploaderId: string,
  rows: Array<{ createdAt: RawBuilder<Date>; deleted?: boolean }>,
) => {
  await services.db
    .insertInto("chapters")
    .values(
      rows.map(({ createdAt, deleted = false }, index) => ({
        mediaId: SEEDED_MEDIA_ID,
        number: 99_000 + index,
        language: "en" as const,
        uploaderId,
        createdAt,
        deletedAt: deleted ? new Date() : null,
      })),
    )
    .execute()
}
const signInUploader = async (services: Services, displayUsername?: string) => {
  const { userId } = await signInAs(services, { role: "UPLOADER" })

  if (displayUsername !== undefined) {
    await services.db
      .updateTable("users")
      .set({ displayUsername })
      .where("id", "=", userId)
      .execute()
  }

  return userId
}
const readsBy = (userIds: string[], chapterId: string, createdAt: RawBuilder<Date>) =>
  userIds.map((userId) => ({ userId, chapterId, createdAt }))
const read = async (
  services: Services,
  rows: Array<{ userId: string; chapterId: string; createdAt: RawBuilder<Date> }>,
) => {
  await services.db.insertInto("userHistories").values(rows).execute()
}

describe("GET /dashboard/overview", () => {
  test("requires a session", async ({ app }) => {
    const res = await api(app, "/dashboard/overview")

    expect(res.status).toBe(401)
  })

  test.for(["USER", "UPLOADER", "UPLOADER_INTERN"] as const)(
    "forbids %s",
    async (role, { app, services }) => {
      const { headers } = await signInAs(services, { role })
      const res = await api(app, "/dashboard/overview", { headers })

      expect(res.status).toBe(403)
    },
  )

  test("forbids banned moderators", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "MODERATOR", banned: true })
    const res = await api(app, "/dashboard/overview", { headers })

    expect(res.status).toBe(403)
  })

  test.for(["MODERATOR", "ADMIN"] as const)(
    "allows %s with the defaults",
    async (role, { app, services }) => {
      const { headers } = await signInAs(services, { role })
      const overview = await getOverview(app, headers)

      expect(overview).toMatchObject({ range: "30d", unit: "day", timeZone: "UTC" })
      expect(overview.buckets).toHaveLength(30)
    },
  )

  test.for(["range=1y", "tz=Mars/Olympus", "tz=%2B03:00", "tz="])(
    "rejects %s",
    async (query, { app, services }) => {
      const { headers } = await signInAs(services, { role: "ADMIN" })
      const res = await api(app, `/dashboard/overview?${query}`, { headers })

      expect(res.status).toBe(422)
    },
  )

  test("canonicalizes time zone aliases", async ({ app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const overview = await getOverview(app, headers, "tz=US/Eastern")

    expect(overview.timeZone).toBe("America/New_York")
  })

  test.for([
    ["24h", "hour", 24],
    ["7d", "day", 7],
    ["30d", "day", 30],
    ["90d", "week", 13],
    ["12m", "month", 12],
  ] as const)("buckets %s by %s", async ([range, unit, count], { app, services }) => {
    const { headers } = await signInAs(services, { role: "ADMIN" })
    const overview = await getOverview(app, headers, `range=${range}`)

    expect(overview).toMatchObject({ range, unit, timeZone: "UTC" })
    expect(overview.buckets).toEqual(utcBuckets(unit, count))

    for (const metric of Object.values(overview.metrics)) {
      expect(metric.current).toHaveLength(count)
      expect(metric.previous).toHaveLength(count)
    }
  })

  test("places reads in their current or previous bucket", async ({ app, services }) => {
    const headers = await signInAndAgeSeeds(services)
    const [userId] = await createReaders(services, 1)
    const chapters = await getChapters(services, 6)
    const at = [
      dayAt(2, 12),
      dayAt(9, 12),
      dayAt(20, 12),
      sql<Date>`now() - interval '7 days' - (now() - date_trunc('day', now())) / 2`,
      sql<Date>`now() - interval '7 days' + (date_trunc('day', now()) + interval '1 day' - now()) / 2`,
      sql<Date>`now() - (now() - date_trunc('day', now())) / 2`,
    ]

    await read(
      services,
      chapters.map((chapter, index) => ({
        userId: defined(userId),
        chapterId: chapter.id,
        createdAt: defined(at[index]),
      })),
    )

    const overview = await getOverview(app, headers, "range=7d")

    expect(overview.buckets[0]).toBe(new Date(utcMidnight(6)).toISOString())
    expect(overview.buckets.at(-1)).toBe(new Date(utcMidnight(0)).toISOString())
    expect(overview.metrics.reads).toEqual({
      total: 2,
      previousTotal: 2,
      current: [0, 0, 0, 0, 1, 0, 1],
      previous: [0, 0, 0, 0, 1, 0, 1],
    })
  })

  test("counts library adds, live chapters and new accounts", async ({ app, services }) => {
    const headers = await signInAndAgeSeeds(services)
    const [userId] = await createReaders(services, 1)
    const { db } = services

    await db
      .updateTable("users")
      .set({ createdAt: dayAt(3, 12) })
      .where("id", "=", defined(userId))
      .execute()
    await db
      .insertInto("userLibraryEntries")
      .values([
        {
          userId: defined(userId),
          mediaId: SEEDED_MEDIA_ID,
          status: "READING",
          createdAt: dayAt(1, 12),
        },
      ])
      .execute()
    await db
      .insertInto("chapters")
      .values([
        {
          mediaId: SEEDED_MEDIA_ID,
          number: 97_001,
          language: "en",
          uploaderId: defined(userId),
          createdAt: dayAt(1, 12),
        },
        {
          mediaId: SEEDED_MEDIA_ID,
          number: 97_002,
          language: "en",
          uploaderId: defined(userId),
          createdAt: dayAt(8, 12),
        },
        {
          mediaId: SEEDED_MEDIA_ID,
          number: 97_003,
          language: "en",
          uploaderId: defined(userId),
          createdAt: dayAt(1, 12),
          deletedAt: new Date(),
        },
      ])
      .execute()

    const { metrics } = await getOverview(app, headers, "range=7d")

    expect(metrics.libraryAdds.current).toEqual([0, 0, 0, 0, 0, 1, 0])
    expect(metrics.chaptersUploaded).toMatchObject({
      total: 1,
      previousTotal: 1,
      current: [0, 0, 0, 0, 0, 1, 0],
      previous: [0, 0, 0, 0, 0, 1, 0],
    })
    expect(metrics.newAccounts).toMatchObject({ total: 1, current: [0, 0, 0, 1, 0, 0, 0] })
  })

  test("follows the requested time zone", async ({ app, services }) => {
    const headers = await signInAndAgeSeeds(services)
    const [userId] = await createReaders(services, 1)
    const [chapter] = await getChapters(services, 1)

    await read(services, [
      { userId: defined(userId), chapterId: defined(chapter).id, createdAt: dayAt(2, 2) },
    ])

    const utc = await getOverview(app, headers, "range=7d&tz=UTC")
    const saoPaulo = await getOverview(app, headers, "range=7d&tz=America/Sao_Paulo")
    const utcBucket = utc.metrics.reads.current.indexOf(1)
    const saoPauloBucket = saoPaulo.metrics.reads.current.indexOf(1)

    expect(utc.buckets[utcBucket]).toBe(new Date(utcMidnight(2)).toISOString())
    expect(saoPaulo.buckets[saoPauloBucket]).toBe(new Date(utcMidnight(3) + 3 * HOUR).toISOString())
    expect(defined(utc.readingHours[isoWeekday(utcMidnight(2))])[2]).toBe(1)
    expect(defined(saoPaulo.readingHours[isoWeekday(utcMidnight(3))])[23]).toBe(1)
    expect(saoPaulo.readingHours).toHaveLength(7)
    expect(saoPaulo.readingHours.every((hours) => hours.length === 24)).toBe(true)
    expect(saoPaulo.readingHours.flat().reduce((total, reads) => total + reads, 0)).toBe(1)
  })

  test("counts unique readers once per bucket and once per window", async ({ app, services }) => {
    const headers = await signInAndAgeSeeds(services)
    const [first, second] = await createReaders(services, 2)
    const chapters = (await getChapters(services, 5)).map((chapter) => chapter.id)

    await read(services, [
      { userId: defined(first), chapterId: defined(chapters[0]), createdAt: dayAt(2, 12) },
      { userId: defined(first), chapterId: defined(chapters[1]), createdAt: dayAt(1, 12) },
      { userId: defined(second), chapterId: defined(chapters[2]), createdAt: dayAt(1, 13) },
      { userId: defined(first), chapterId: defined(chapters[3]), createdAt: dayAt(9, 12) },
      { userId: defined(first), chapterId: defined(chapters[4]), createdAt: dayAt(8, 12) },
    ])

    const { metrics } = await getOverview(app, headers, "range=7d")

    expect(metrics.reads.total).toBe(3)
    expect(metrics.uniqueReaders).toEqual({
      total: 2,
      previousTotal: 1,
      current: [0, 0, 0, 0, 1, 2, 0],
      previous: [0, 0, 0, 0, 1, 1, 0],
    })
  })

  test("breaks reads down by language", async ({ app, services }) => {
    const headers = await signInAndAgeSeeds(services)
    const languages = ["en", "pt_br", "es", "fr", "de", "ja", "ko"] as const
    const readers = await createReaders(services, languages.length)
    const chapters = await getChapters(services, languages.length)

    for (const [index, chapter] of chapters.entries()) {
      await services.db
        .updateTable("chapters")
        .set({ language: defined(languages[index]) })
        .where("id", "=", chapter.id)
        .execute()
    }

    await read(
      services,
      chapters.flatMap((chapter, index) =>
        readsBy(readers.slice(0, languages.length - index), chapter.id, dayAt(1, 12)),
      ),
    )

    const overview = await getOverview(app, headers, "range=7d")

    expect(overview.readsByLanguage).toEqual([
      { language: "en", reads: 7 },
      { language: "pt_br", reads: 6 },
      { language: "es", reads: 5 },
      { language: "fr", reads: 4 },
      { language: "de", reads: 3 },
    ])
    expect(overview.otherLanguageReads).toBe(3)
    expect(overview.metrics.reads.total).toBe(28)
  })

  test("ranks the most read live medias", async ({ app, services }) => {
    const headers = await signInAndAgeSeeds(services)
    const readers = await createReaders(services, 4)
    const [deleted, top, second, third] = await services.db
      .selectFrom("chapters")
      .where("deletedAt", "is", null)
      .distinctOn("mediaId")
      .select(["mediaId", "id as chapterId"])
      .orderBy("mediaId")
      .orderBy("id")
      .limit(4)
      .execute()
    const plan = [
      [defined(deleted), 4],
      [defined(top), 3],
      [defined(second), 2],
      [defined(third), 1],
    ] as const

    await services.db
      .updateTable("medias")
      .set({ deletedAt: new Date() })
      .where("id", "=", defined(deleted).mediaId)
      .execute()
    await read(
      services,
      plan.flatMap(([media, reads]) =>
        readsBy(readers.slice(0, reads), media.chapterId, sql<Date>`now() - interval '1 hour'`),
      ),
    )

    const titles = await services.db
      .selectFrom("titles")
      .where("isMainTitle", "=", true)
      .where("deletedAt", "is", null)
      .select(["mediaId", "title"])
      .execute()
    const titleOf = new Map(titles.map((title) => [title.mediaId, title.title]))
    const { topMedias } = await getOverview(app, headers)

    expect(topMedias.map(({ id, reads }) => ({ id, reads }))).toEqual([
      { id: defined(top).mediaId, reads: 3 },
      { id: defined(second).mediaId, reads: 2 },
      { id: defined(third).mediaId, reads: 1 },
    ])
    expect(topMedias.map((media) => media.title)).toEqual(
      [top, second, third].map((media) => titleOf.get(defined(media).mediaId)),
    )
  })

  test("lists every media type in the catalog mix", async ({ app, services }) => {
    const headers = await signInAndAgeSeeds(services)
    const { db } = services
    const [deleted, lightNovel] = await db
      .selectFrom("medias")
      .select("id")
      .where("type", "=", "MANGA")
      .orderBy("id")
      .limit(2)
      .execute()

    await db
      .updateTable("medias")
      .set({ deletedAt: new Date() })
      .where("id", "=", defined(deleted).id)
      .execute()
    await db
      .updateTable("medias")
      .set({ type: "LIGHT_NOVEL" })
      .where("id", "=", defined(lightNovel).id)
      .execute()

    const counts = await db
      .selectFrom("medias")
      .where("deletedAt", "is", null)
      .select((eb) => ["type", eb.fn.countAll<string>().as("count")])
      .groupBy("type")
      .execute()
    const countOf = new Map(counts.map((row) => [row.type, Number(row.count)]))
    const { catalogMix } = await getOverview(app, headers)

    expect(catalogMix).toEqual(MEDIA_TYPES.map((type) => ({ type, count: countOf.get(type) ?? 0 })))
    expect(catalogMix.find((entry) => entry.type === "LIGHT_NOVEL")?.count).toBe(1)
    expect(catalogMix.some((entry) => entry.count === 0)).toBe(true)
  })

  test("counts pending ownership requests and failed uploads", async ({ app, services }) => {
    const headers = await signInAndAgeSeeds(services)
    const [first, second, third] = await createReaders(services, 3)
    const { db } = services
    const liveGroupId = crypto.randomUUID()
    const deletedGroupId = crypto.randomUUID()

    await db
      .insertInto("groups")
      .values([
        { id: liveGroupId, name: `Group ${liveGroupId}`, creatorId: defined(first) },
        {
          id: deletedGroupId,
          name: `Group ${deletedGroupId}`,
          creatorId: defined(first),
          deletedAt: new Date(),
        },
      ])
      .execute()
    await db
      .insertInto("groupOwnershipRequests")
      .values([
        { userId: defined(first), groupId: liveGroupId, status: "PENDING" },
        { userId: defined(second), groupId: liveGroupId, status: "APPROVED" },
        { userId: defined(third), groupId: deletedGroupId, status: "PENDING" },
      ])
      .execute()
    await db
      .insertInto("tasks")
      .values(
        (["FAILED", "FINISHED", "PENDING"] as const).map((status) => ({
          type: "UPLOAD_CHAPTER" as const,
          status,
          sessionId: crypto.randomUUID(),
          payload: {},
        })),
      )
      .execute()

    const { attention } = await getOverview(app, headers)

    expect(attention).toEqual({ pendingOwnershipRequests: 1, failedUploads: 1 })
  })

  test("groups recent uploads by uploader, media and hour", async ({ app, services }) => {
    const headers = await signInAndAgeSeeds(services)
    const { userId: uploaderId } = await signInAs(services, { role: "UPLOADER" })
    const { db } = services
    const otherMedia = await db
      .selectFrom("medias")
      .select("id")
      .where("id", "!=", SEEDED_MEDIA_ID)
      .orderBy("id")
      .executeTakeFirstOrThrow()

    await db
      .insertInto("chapters")
      .values([
        ...[0.25, 0.5, 0.75].map((share, index) => ({
          mediaId: SEEDED_MEDIA_ID,
          number: 98_001 + index,
          language: "en" as const,
          uploaderId,
          createdAt: withinHour(share),
        })),
        {
          mediaId: SEEDED_MEDIA_ID,
          number: 98_004,
          language: "en",
          uploaderId,
          createdAt: withinHour(0.5),
          deletedAt: new Date(),
        },
        {
          mediaId: SEEDED_MEDIA_ID,
          number: 98_005,
          language: "en",
          uploaderId,
          createdAt: sql`date_trunc('hour', now()) - interval '2 hours'`,
        },
      ])
      .execute()
    await db
      .insertInto("covers")
      .values({ mediaId: SEEDED_MEDIA_ID, uploaderId, language: "en", createdAt: withinHour(0.1) })
      .execute()
    await db
      .updateTable("medias")
      .set({
        creatorId: uploaderId,
        createdAt: sql`date_trunc('hour', now()) - interval '3 hours'`,
      })
      .where("id", "=", otherMedia.id)
      .execute()

    const { recentActivity } = await getOverview(app, headers)
    const mine = recentActivity.filter((item) => item.actor.id === uploaderId)
    const title = await db
      .selectFrom("titles")
      .select("title")
      .where("mediaId", "=", SEEDED_MEDIA_ID)
      .where("isMainTitle", "=", true)
      .executeTakeFirstOrThrow()
    const times = recentActivity.map((item) => Date.parse(item.at))

    expect(recentActivity).toHaveLength(6)
    expect(times.slice(1).every((time, index) => time <= defined(times[index]))).toBe(true)
    expect(mine.map(({ kind, count, media }) => ({ kind, count, mediaId: media.id }))).toEqual([
      { kind: "CHAPTERS_UPLOADED", count: 3, mediaId: SEEDED_MEDIA_ID },
      { kind: "COVERS_UPLOADED", count: 1, mediaId: SEEDED_MEDIA_ID },
      { kind: "CHAPTERS_UPLOADED", count: 1, mediaId: SEEDED_MEDIA_ID },
      { kind: "MEDIA_CREATED", count: 1, mediaId: otherMedia.id },
    ])
    expect(defined(mine[0])).toMatchObject({
      actor: { id: uploaderId, image: null },
      media: { title: title.title },
    })
    expect(defined(mine[0]).actor.username).toEqual(expect.any(String))
  })

  test("counts every upload of a busy hour beyond the sampled rows", async ({ app, services }) => {
    const headers = await signInAndAgeSeeds(services)
    const uploaderId = await signInUploader(services)

    await insertChapters(
      services,
      uploaderId,
      Array.from({ length: 150 }, (_, index) => ({ createdAt: withinHour(index / 150) })),
    )

    const { recentActivity } = await getOverview(app, headers)

    expect(recentActivity[0]).toMatchObject({
      kind: "CHAPTERS_UPLOADED",
      count: 150,
      actor: { id: uploaderId },
    })
  })

  test("ranks uploaders by live chapters in the current window", async ({ app, services }) => {
    const headers = await signInAndAgeSeeds(services)
    const [busiest, beta, alpha, previousOnly, deletedOnly] = await Promise.all([
      signInUploader(services, "Zulu"),
      signInUploader(services, "Beta"),
      signInUploader(services, "Alpha"),
      signInUploader(services),
      signInUploader(services),
    ])

    await insertChapters(services, busiest, [
      { createdAt: dayAt(1, 12) },
      { createdAt: dayAt(2, 12) },
      { createdAt: dayAt(3, 12) },
      { createdAt: dayAt(8, 12) },
    ])
    await insertChapters(services, beta, [
      { createdAt: dayAt(1, 12) },
      { createdAt: dayAt(1, 13) },
      { createdAt: dayAt(1, 14), deleted: true },
    ])
    await insertChapters(services, alpha, [
      { createdAt: dayAt(2, 12) },
      { createdAt: dayAt(4, 12) },
      { createdAt: dayAt(9, 12) },
      { createdAt: dayAt(10, 12) },
    ])
    await insertChapters(services, previousOnly, [
      { createdAt: dayAt(8, 12) },
      { createdAt: dayAt(9, 12) },
      { createdAt: dayAt(10, 12) },
    ])
    await insertChapters(services, deletedOnly, [{ createdAt: dayAt(1, 12), deleted: true }])

    const { topUploaders } = await getOverview(app, headers, "range=7d")

    expect(topUploaders).toEqual([
      expect.objectContaining({
        id: busiest,
        displayUsername: "Zulu",
        chapters: 3,
        previousChapters: 1,
      }),
      expect.objectContaining({
        id: alpha,
        displayUsername: "Alpha",
        chapters: 2,
        previousChapters: 2,
      }),
      expect.objectContaining({
        id: beta,
        displayUsername: "Beta",
        chapters: 2,
        previousChapters: 0,
      }),
    ])
    expect(defined(topUploaders[0])).toMatchObject({ id: busiest, image: null })
    expect(defined(topUploaders[0]).username).toEqual(expect.any(String))
  })

  test("returns at most eight uploaders", async ({ app, services }) => {
    const headers = await signInAndAgeSeeds(services)
    const uploaders = await Promise.all(Array.from({ length: 9 }, () => signInUploader(services)))

    for (const [index, uploaderId] of uploaders.entries()) {
      await insertChapters(
        services,
        uploaderId,
        Array.from({ length: index + 1 }, () => ({ createdAt: dayAt(1, 12) })),
      )
    }

    const { topUploaders } = await getOverview(app, headers, "range=7d")

    expect(topUploaders.map((uploader) => uploader.chapters)).toEqual([9, 8, 7, 6, 5, 4, 3, 2])
    expect(topUploaders.map((uploader) => uploader.id)).not.toContain(uploaders[0])
  })

  test("caches the range-dependent part per range and canonical time zone", async ({
    app,
    services,
  }) => {
    const headers = await signInAndAgeSeeds(services)
    const [readerId] = await createReaders(services, 1)
    const [chapter] = await getChapters(services, 1)
    const uploaderId = await signInUploader(services)
    const groupId = crypto.randomUUID()
    const first = await getOverview(app, headers, "range=7d&tz=US/Eastern")

    await read(services, [
      { userId: defined(readerId), chapterId: defined(chapter).id, createdAt: dayAt(1, 12) },
    ])
    await services.db
      .insertInto("groups")
      .values({ id: groupId, name: `Group ${groupId}`, creatorId: uploaderId })
      .execute()
    await services.db
      .insertInto("groupOwnershipRequests")
      .values({ userId: uploaderId, groupId, status: "PENDING" })
      .execute()
    await insertChapters(services, uploaderId, [{ createdAt: withinHour(0.5) }])

    const cached = await getOverview(app, headers, "range=7d&tz=America/New_York")
    const fresh = await getOverview(app, headers, "range=30d&tz=America/New_York")

    expect(first.timeZone).toBe("America/New_York")
    expect(cached.metrics).toEqual(first.metrics)
    expect(cached.topUploaders).toEqual(first.topUploaders)
    expect(cached.attention.pendingOwnershipRequests).toBe(
      first.attention.pendingOwnershipRequests + 1,
    )
    expect(cached.recentActivity[0]?.actor.id).toBe(uploaderId)
    expect(fresh.metrics.reads.total).toBe(first.metrics.reads.total + 1)
    expect(fresh.topUploaders.map((uploader) => uploader.id)).toContain(uploaderId)
  })
})
