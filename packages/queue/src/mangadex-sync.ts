import type {
  DB,
  MangaDexSyncItem,
  MediaLanguage,
  Selectable,
  SupportedLanguage,
} from "@taiyomoe/db"
import { config } from "@taiyomoe/config"
import {
  type MangaDexChapter,
  type MangaDexClient,
  type MangaDexCover,
  type MangaDexGroup,
  toChapterNumber,
  toChapterTitle,
  toGroupValues,
  toMediaLanguage,
  toSupportedLanguage,
  toVolume,
} from "@taiyomoe/mangadex"
import {
  DeleteObjectsCommand,
  getChapterPageKey,
  getCoverKey,
  PutObjectCommand,
  type S3Client,
} from "@taiyomoe/s3"
import { Queue } from "bullmq"
import { type Kysely, sql, type Transaction } from "kysely"
import sharp from "sharp"
import { awardMetricAchievements } from "./achievements"
import { createBullConnection } from "./connection"
import { transcodeChapterPage } from "./processor"

export const MANGADEX_SYNC_QUEUE = "mangadex-sync"

export type MangaDexSyncJobData = { syncId: string }

export type MangaDexSyncProducer = {
  enqueue: (data: MangaDexSyncJobData) => Promise<void>
}

let queue: Queue<MangaDexSyncJobData> | undefined

export const getMangaDexSyncProducer = () =>
  ({
    enqueue: async (data) => {
      if (queue === undefined) {
        queue = new Queue<MangaDexSyncJobData>(MANGADEX_SYNC_QUEUE, {
          connection: createBullConnection(),
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: "exponential", delay: 30_000 },
            removeOnComplete: { age: 3_600, count: 1_000 },
            removeOnFail: { age: 24 * 3_600 },
          },
        })
        // Unhandled, a Redis connection error would crash the API.
        queue.on("error", (err) => {
          // oxlint-disable-next-line no-console
          console.error(`${MANGADEX_SYNC_QUEUE} queue error:`, err.message)
        })
      }

      await queue.add("sync", data, { jobId: data.syncId })
    },
  }) satisfies MangaDexSyncProducer

export type MangaDexSyncDeps = {
  db: Kysely<DB>
  s3: S3Client
  s3Bucket: string
  mangaDex: MangaDexClient
}

type SyncContext = MangaDexSyncDeps & {
  mediaId: string
  mangaDexId: string
  userId: string
}

type SyncItem = Pick<Selectable<MangaDexSyncItem>, "id">

type ItemOutcome = { status: "DONE"; entityId: string } | { status: "SKIPPED"; error: string }

class SkipItem extends Error {}

const deleteKeys = async ({ s3, s3Bucket }: MangaDexSyncDeps, keys: string[]) => {
  for (let start = 0; start < keys.length; start += 1000) {
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: s3Bucket,
        Delete: { Objects: keys.slice(start, start + 1000).map((Key) => ({ Key })) },
      }),
    )
  }
}
const resolveGroupId = async (trx: Transaction<DB>, group: MangaDexGroup, creatorId: string) => {
  const values = toGroupValues(group)

  if (values.name === "") {
    return null
  }

  const existing = await trx
    .selectFrom("groups")
    .select("id")
    .where(sql<string>`lower("name")`, "=", values.name.toLowerCase())
    .where("deletedAt", "is", null)
    .orderBy("createdAt")
    .limit(1)
    .executeTakeFirst()

  if (existing !== undefined) {
    return existing.id
  }

  // Groups made here have no owner: the real group claims theirs through an ownership request.
  const created = await trx
    .insertInto("groups")
    .values({ ...values, creatorId })
    .returning("id")
    .executeTakeFirstOrThrow()

  return created.id
}
const finishItem = (
  db: Kysely<DB>,
  item: SyncItem,
  outcome: ItemOutcome | { status: "FAILED"; error: string },
) =>
  db
    .updateTable("mangaDexSyncItems")
    .set({
      status: outcome.status,
      error: outcome.status === "DONE" ? null : outcome.error.slice(0, 1000),
      entityId: outcome.status === "DONE" ? outcome.entityId : null,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where("id", "=", item.id)
    .execute()
const importCover = async (ctx: SyncContext, cover: MangaDexCover, item: SyncItem) => {
  const language: MediaLanguage | null = toMediaLanguage(cover.locale)

  if (language === null) {
    throw new SkipItem(`MangaDex cover locale ${cover.locale ?? "none"} is not supported`)
  }

  const input = await ctx.mangaDex.download(cover.url)
  const body = await sharp(input, { limitInputPixels: config.images.maxDecodedPixels })
    .rotate()
    .jpeg({ quality: config.images.quality })
    .toBuffer()
  const id = crypto.randomUUID()
  const key = getCoverKey(ctx.mediaId, `${id}.jpg`)

  await ctx.s3.send(
    new PutObjectCommand({ Bucket: ctx.s3Bucket, Key: key, Body: body, ContentType: "image/jpeg" }),
  )

  try {
    await ctx.db.transaction().execute(async (trx) => {
      const main = await trx
        .selectFrom("covers")
        .select("id")
        .where("mediaId", "=", ctx.mediaId)
        .where("isMainCover", "=", true)
        .where("deletedAt", "is", null)
        .executeTakeFirst()

      await trx
        .insertInto("covers")
        .values({
          id,
          mediaId: ctx.mediaId,
          extension: "jpg",
          volume: toVolume(cover.volume),
          language,
          isMainCover: main === undefined,
          uploaderId: ctx.userId,
        })
        .execute()

      await finishItem(trx, item, { status: "DONE", entityId: id })
    })
  } catch (error) {
    await deleteKeys(ctx, [key]).catch(() => {})

    throw error
  }
}
const importChapter = async (ctx: SyncContext, chapter: MangaDexChapter, item: SyncItem) => {
  const language: SupportedLanguage | null = toSupportedLanguage(chapter.language)
  const number = toChapterNumber(chapter.chapter, chapter.volume)

  if (language === null) {
    throw new SkipItem(`MangaDex chapter language ${chapter.language} is not supported`)
  }

  if (number === null) {
    throw new SkipItem(`MangaDex chapter number "${chapter.chapter ?? ""}" is not a number`)
  }

  if (chapter.isUnavailable) {
    throw new SkipItem("The chapter is no longer available on MangaDex")
  }

  const isExternal = chapter.externalUrl !== null

  if (!isExternal && (chapter.pages === 0 || chapter.pages > config.images.maxChapterPages)) {
    throw new SkipItem(`The chapter has ${chapter.pages} pages`)
  }

  const id = crypto.randomUUID()
  const pageIds: string[] = []
  const keys: string[] = []

  try {
    if (!isExternal) {
      let source = await ctx.mangaDex.getPageSource(chapter.id)

      for (const [index, url] of source.urls.entries()) {
        const pageId = crypto.randomUUID()
        let body: Buffer

        try {
          let bytes: Buffer

          try {
            bytes = await ctx.mangaDex.download(source.urls[index] ?? url, {
              reportsTo: source.reportsTo,
            })
          } catch {
            // A failing MangaDex@Home node is left for another one, which a new page source assigns.
            source = await ctx.mangaDex.getPageSource(chapter.id)
            bytes = await ctx.mangaDex.download(source.urls[index] ?? url, {
              reportsTo: source.reportsTo,
            })
          }

          body = await transcodeChapterPage(pageId, bytes)
        } catch (error) {
          throw new Error(
            `Page ${index + 1}: ${error instanceof Error ? error.message : String(error)}`,
          )
        }

        const key = getChapterPageKey(ctx.mediaId, id, pageId)

        await ctx.s3.send(
          new PutObjectCommand({
            Bucket: ctx.s3Bucket,
            Key: key,
            Body: body,
            ContentType: "image/jpeg",
          }),
        )
        pageIds.push(pageId)
        keys.push(key)
      }
    }

    const publishedAt = new Date(chapter.publishedAt)

    await ctx.db.transaction().execute(async (trx) => {
      const groupIds = new Set<string>()

      for (const group of chapter.groups.slice(0, config.input.maxChapterGroups)) {
        const groupId = await resolveGroupId(trx, group, ctx.userId)

        if (groupId !== null) {
          groupIds.add(groupId)
        }
      }

      // Imported chapters keep their MangaDex release date, so a backfill neither floods the
      // latest updates nor notifies readers about old chapters.
      await trx
        .insertInto("chapters")
        .values({
          id,
          mediaId: ctx.mediaId,
          uploaderId: ctx.userId,
          title: toChapterTitle(chapter.title),
          number,
          volume: toVolume(chapter.volume),
          language,
          status: "PUBLISHED",
          isExternal,
          externalUrl: chapter.externalUrl,
          pages: isExternal ? null : pageIds.map((pageId) => ({ id: pageId })),
          createdAt:
            Number.isNaN(publishedAt.getTime()) || publishedAt > new Date()
              ? sql<Date>`CURRENT_TIMESTAMP`
              : publishedAt,
        })
        .execute()

      if (groupIds.size > 0) {
        await trx
          .insertInto("chapterGroups")
          .values([...groupIds].map((groupId) => ({ chapterId: id, groupId })))
          .execute()
      }

      await awardMetricAchievements(trx, ctx.userId)
      await finishItem(trx, item, { status: "DONE", entityId: id })
    })
  } catch (error) {
    await deleteKeys(ctx, keys).catch(() => {})

    throw error
  }
}

/**
 * Imports the covers and chapters a sync lists, one at a time. Each item settles on its own, so a
 * failed chapter is reported without stopping the others, and a retried job resumes where the
 * last attempt stopped. Metadata (titles, staff, tags…) was already applied when the sync started.
 */
export const runMangaDexSync = async (
  deps: MangaDexSyncDeps,
  { syncId }: MangaDexSyncJobData,
  { isFinalAttempt = true }: { isFinalAttempt?: boolean } = {},
) => {
  const { db } = deps
  const sync = await db
    .updateTable("mangaDexSyncs")
    .set({ status: "RUNNING", updatedAt: sql`CURRENT_TIMESTAMP` })
    .where("id", "=", syncId)
    .where("status", "in", ["PENDING", "RUNNING"])
    .returning(["id", "mediaId", "mangaDexId", "userId"])
    .executeTakeFirst()

  if (sync === undefined) {
    return undefined
  }

  const finish = async (
    status: "FINISHED" | "FAILED" | "CANCELLED",
    error: string | null = null,
  ) => {
    await db
      .updateTable("mangaDexSyncs")
      .set({
        status,
        error,
        finishedAt: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where("id", "=", syncId)
      .where("status", "=", "RUNNING")
      .execute()
  }

  try {
    const uploader = await db
      .selectFrom("users")
      .innerJoin("medias", (join) =>
        join.on("medias.id", "=", sync.mediaId).on("medias.deletedAt", "is", null),
      )
      .select("users.id")
      .where("users.id", "=", sync.userId)
      .where("users.role", "in", ["UPLOADER", "ADMIN"])
      .where(
        sql<boolean>`not (coalesce("users"."banned", false) and ("users"."banExpires" is null or "users"."banExpires" > (CURRENT_TIMESTAMP at time zone 'UTC')))`,
      )
      .executeTakeFirst()

    if (uploader === undefined) {
      await finish("FAILED", "The media was deleted, or its uploader may no longer sync it.")

      return { syncId, mediaId: sync.mediaId, status: "FAILED" as const }
    }

    const items = await db
      .selectFrom("mangaDexSyncItems")
      .selectAll()
      .where("syncId", "=", syncId)
      .where("status", "=", "PENDING")
      .orderBy("position")
      .execute()
    const coverIds = items.filter((item) => item.kind === "COVER").map((item) => item.mangaDexId)
    const chapterIds = items
      .filter((item) => item.kind === "CHAPTER")
      .map((item) => item.mangaDexId)
    const covers = new Map(
      (coverIds.length === 0 ? [] : await deps.mangaDex.getCovers(sync.mangaDexId, coverIds)).map(
        (cover) => [cover.id, cover],
      ),
    )
    const chapters = new Map(
      (chapterIds.length === 0 ? [] : await deps.mangaDex.getChapters(chapterIds)).map(
        (chapter) => [chapter.id, chapter],
      ),
    )
    const ctx: SyncContext = { ...deps, ...sync }

    for (const item of items) {
      const current = await db
        .selectFrom("mangaDexSyncs")
        .innerJoin("medias", "medias.id", "mangaDexSyncs.mediaId")
        .select(["mangaDexSyncs.status", "medias.flag"])
        .where("mangaDexSyncs.id", "=", syncId)
        .executeTakeFirstOrThrow()

      if (current.status !== "RUNNING") {
        return { syncId, mediaId: sync.mediaId, status: current.status }
      }

      if (current.flag === "LOCKED") {
        await finish("FAILED", "The media was locked following a copyright notice.")

        return { syncId, mediaId: sync.mediaId, status: "FAILED" as const }
      }

      const imported = await db
        .selectFrom("mangaDexSyncItems")
        .select("entityId")
        .where("kind", "=", item.kind)
        .where("mangaDexId", "=", item.mangaDexId)
        .where("status", "=", "DONE")
        .executeTakeFirst()

      if (imported !== undefined) {
        await finishItem(db, item, { status: "SKIPPED", error: "Already imported by another sync" })

        continue
      }

      try {
        const cover = covers.get(item.mangaDexId)
        const chapter = chapters.get(item.mangaDexId)

        if (item.kind === "COVER") {
          if (cover === undefined) {
            throw new SkipItem("The cover is no longer on MangaDex")
          }

          await importCover(ctx, cover, item)
        } else {
          if (chapter === undefined) {
            throw new SkipItem("The chapter is no longer on MangaDex")
          }

          await importChapter(ctx, chapter, item)
        }
      } catch (error) {
        await finishItem(
          db,
          item,
          error instanceof SkipItem
            ? { status: "SKIPPED", error: error.message }
            : { status: "FAILED", error: error instanceof Error ? error.message : String(error) },
        )
      }
    }

    await finish("FINISHED")

    const counts = await db
      .selectFrom("mangaDexSyncItems")
      .select(["status", db.fn.countAll<string>().as("count")])
      .where("syncId", "=", syncId)
      .groupBy("status")
      .execute()

    return {
      syncId,
      mediaId: sync.mediaId,
      status: "FINISHED" as const,
      ...Object.fromEntries(counts.map((row) => [row.status.toLowerCase(), Number(row.count)])),
    }
  } catch (error) {
    if (isFinalAttempt) {
      await finish("FAILED", error instanceof Error ? error.message : String(error))
    }

    throw error
  }
}
