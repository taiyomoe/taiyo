import {
  type Chapter,
  type DB,
  type Kysely,
  type Selectable,
  sql,
  type UserHistory,
  type UserLibraryEntry,
} from "@taiyomoe/db"
import {
  CopyObjectCommand,
  DeleteObjectsCommand,
  getChapterPageKey,
  type S3Client,
} from "@taiyomoe/s3"

type MergedChapter = Pick<
  Selectable<Chapter>,
  "id" | "mediaId" | "number" | "language" | "status" | "isExternal" | "externalUrl" | "pages"
>

export type ChapterFold = { from: MergedChapter; into: MergedChapter }

const INSERT_BATCH = 1000
const insertInBatches = async <T>(rows: T[], insert: (batch: T[]) => Promise<unknown>) => {
  for (let start = 0; start < rows.length; start += INSERT_BATCH) {
    await insert(rows.slice(start, start + INSERT_BATCH))
  }
}
const latest = (a: Date, b: Date) => (a.getTime() >= b.getTime() ? a : b)
const earliest = (a: Date, b: Date) => (a.getTime() <= b.getTime() ? a : b)

/** Whether the media or one of the others still has pages or a MangaDex sync being processed. */
export const isMergeBusy = async (db: Kysely<DB>, mediaIds: readonly string[]) => {
  const [task, sync] = await Promise.all([
    db
      .selectFrom("tasks")
      .select("id")
      .where("status", "in", ["PENDING", "DOWNLOADING", "UPLOADING"])
      .where(sql<string>`payload->>'mediaId'`, "in", mediaIds)
      .limit(1)
      .executeTakeFirst(),
    db
      .selectFrom("mangaDexSyncs")
      .select("id")
      .where("status", "in", ["PENDING", "RUNNING"])
      .where("mediaId", "in", mediaIds)
      .limit(1)
      .executeTakeFirst(),
  ])

  return task !== undefined || sync !== undefined
}

/**
 * Splits the live chapters of the duplicates into the ones that move to the
 * media and the ones that fold into a copy of the same release it already
 * has: same language, number, status, credited groups and pages count (or
 * external link). The media's own chapters come first, then each duplicate's
 * in order, so a release the media lacks is taken from the first duplicate
 * that has it.
 */
export const planChapterMerge = async (
  db: Kysely<DB>,
  { mediaId, duplicateIds }: { mediaId: string; duplicateIds: readonly string[] },
) => {
  const chapters = await db
    .selectFrom("chapters")
    .select(["id", "mediaId", "number", "language", "status", "isExternal", "externalUrl", "pages"])
    .where("mediaId", "in", [mediaId, ...duplicateIds])
    .where("deletedAt", "is", null)
    .orderBy("createdAt")
    .orderBy("id")
    .forUpdate()
    .execute()
  const credits =
    chapters.length === 0
      ? []
      : await db
          .selectFrom("chapterGroups")
          .select(["chapterId", "groupId"])
          .where(
            "chapterId",
            "in",
            chapters.map((chapter) => chapter.id),
          )
          .execute()
  const groupsOf = new Map<string, string[]>()

  for (const credit of credits) {
    groupsOf.set(credit.chapterId, [...(groupsOf.get(credit.chapterId) ?? []), credit.groupId])
  }

  const releaseOf = (chapter: MergedChapter) =>
    JSON.stringify([
      chapter.language,
      chapter.number,
      chapter.status,
      chapter.isExternal ? chapter.externalUrl : (chapter.pages?.length ?? 0),
      [...(groupsOf.get(chapter.id) ?? [])].sort(),
    ])
  const releases = new Map<string, MergedChapter>()
  const moved: MergedChapter[] = []
  const folds: ChapterFold[] = []

  for (const ownerId of [mediaId, ...duplicateIds]) {
    for (const chapter of chapters.filter((item) => item.mediaId === ownerId)) {
      const release = releaseOf(chapter)
      const kept = releases.get(release)

      if (kept === undefined) {
        releases.set(release, chapter)
      }

      if (ownerId === mediaId) {
        continue
      }

      if (kept === undefined) {
        moved.push(chapter)
      } else {
        folds.push({ from: chapter, into: kept })
      }
    }
  }

  return { moved, folds }
}

export type PageCopy = { from: string; into: string }

const COPY_CONCURRENCY = 32

/**
 * Copies the pages of the chapters moving to the media under its own folder,
 * adding each copy to `copies` as soon as it is made. A page whose file is
 * already missing has nothing to copy.
 */
export const copyChapterPages = async (
  { s3, s3Bucket }: { s3: S3Client; s3Bucket: string },
  {
    mediaId,
    chapters,
    copies,
  }: { mediaId: string; chapters: readonly MergedChapter[]; copies: PageCopy[] },
) => {
  const pending = chapters.flatMap((chapter) =>
    chapter.isExternal
      ? []
      : (chapter.pages ?? []).map((page) => ({
          from: getChapterPageKey(chapter.mediaId, chapter.id, page.id),
          into: getChapterPageKey(mediaId, chapter.id, page.id),
        })),
  )
  const work = async () => {
    for (let copy = pending.shift(); copy !== undefined; copy = pending.shift()) {
      try {
        await s3.send(
          new CopyObjectCommand({
            Bucket: s3Bucket,
            CopySource: `${s3Bucket}/${copy.from}`,
            Key: copy.into,
          }),
        )
        copies.push(copy)
      } catch (error) {
        if (!(error instanceof Error && error.name === "NoSuchKey")) {
          throw error
        }
      }
    }
  }

  await Promise.all(Array.from({ length: COPY_CONCURRENCY }, work))
}

export const deleteKeys = async (
  { s3, s3Bucket }: { s3: S3Client; s3Bucket: string },
  keys: readonly string[],
) => {
  for (let start = 0; start < keys.length; start += 1000) {
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: s3Bucket,
        Delete: { Objects: keys.slice(start, start + 1000).map((Key) => ({ Key })) },
      }),
    )
  }
}

/**
 * Gives the comments of a duplicate's thread to the thread of what it merges
 * into, or the whole thread when that one has none.
 */
const mergeThreads = async (
  db: Kysely<DB>,
  column: "mediaId" | "chapterId",
  { fromId, intoId }: { fromId: string; intoId: string },
) => {
  const threads = await db
    .selectFrom("commentThreads")
    .select(["id", column])
    .where(column, "in", [fromId, intoId])
    .execute()
  const from = threads.find((thread) => thread[column] === fromId)
  const into = threads.find((thread) => thread[column] === intoId)

  if (from === undefined) {
    return
  }

  if (into === undefined) {
    await db.updateTable("commentThreads").set(column, intoId).where("id", "=", from.id).execute()

    return
  }

  await db
    .updateTable("comments")
    .set({ threadId: into.id })
    .where("threadId", "=", from.id)
    .execute()
  await db.deleteFrom("commentThreads").where("id", "=", from.id).execute()
}
/**
 * Moves the reading history of a chapter onto another. History rows are
 * rewritten rather than updated, so they keep when they were read. A reader of
 * both keeps the latest page read and the earliest and latest read times.
 */
const moveHistories = async (
  db: Kysely<DB>,
  { from, into, page }: { from: string; into: string; page: (pageId: string) => string },
) => {
  const kept = await db
    .deleteFrom("userHistories")
    .where("chapterId", "=", into)
    .where(
      "userId",
      "in",
      db.selectFrom("userHistories").select("userId").where("chapterId", "=", from),
    )
    .returningAll()
    .execute()
  const read = await db
    .deleteFrom("userHistories")
    .where("chapterId", "=", from)
    .returningAll()
    .execute()
  const keptBy = new Map(kept.map((row) => [row.userId, row]))
  const rows = read.map((row): Selectable<UserHistory> => {
    const pageId = row.pageId === null ? null : page(row.pageId)
    const other = keptBy.get(row.userId)

    if (other === undefined) {
      return { ...row, chapterId: into, pageId }
    }

    return {
      userId: row.userId,
      chapterId: into,
      pageId: row.updatedAt.getTime() > other.updatedAt.getTime() ? pageId : other.pageId,
      completed: row.completed || other.completed,
      createdAt: earliest(row.createdAt, other.createdAt),
      updatedAt: latest(row.updatedAt, other.updatedAt),
    }
  })

  await insertInBatches(rows, (batch) => db.insertInto("userHistories").values(batch).execute())
}

/**
 * Folds a duplicate copy of a release into the copy kept: its readers,
 * bookmarks, page reports, reading rewards, notifications and comments move
 * to the kept copy, page by page, and the duplicate copy is deleted.
 */
export const foldChapter = async (
  db: Kysely<DB>,
  { fold: { from, into }, actorId }: { fold: ChapterFold; actorId: string },
) => {
  const pages = new Map(
    (from.pages ?? []).flatMap((page, index) => {
      const kept = into.pages?.[index]

      return kept === undefined ? [] : [[page.id, kept.id] as const]
    }),
  )
  const pageMap = JSON.stringify(Object.fromEntries(pages))
  const mappedPage = (column: string) =>
    sql<string>`coalesce((${pageMap}::jsonb ->> ${sql.ref(column)}::text)::uuid, ${sql.ref(column)})`

  await moveHistories(db, { from: from.id, into: into.id, page: (id) => pages.get(id) ?? id })

  await db
    .deleteFrom("pageBookmarks as b")
    .where("b.chapterId", "=", from.id)
    .where((eb) =>
      eb.exists(
        eb
          .selectFrom("pageBookmarks as k")
          .select("k.id")
          .whereRef("k.userId", "=", "b.userId")
          .where("k.chapterId", "=", into.id)
          .where("k.pageId", "=", mappedPage("b.pageId")),
      ),
    )
    .execute()
  await db
    .updateTable("pageBookmarks")
    .set({ chapterId: into.id, pageId: mappedPage("pageId") })
    .where("chapterId", "=", from.id)
    .execute()

  await db
    .deleteFrom("pageReports as r")
    .where("r.chapterId", "=", from.id)
    .where("r.status", "=", "OPEN")
    .where((eb) =>
      eb.exists(
        eb
          .selectFrom("pageReports as k")
          .select("k.id")
          .whereRef("k.reporterId", "=", "r.reporterId")
          .where("k.chapterId", "=", into.id)
          .where("k.status", "=", "OPEN")
          .where("k.pageId", "=", mappedPage("r.pageId")),
      ),
    )
    .execute()
  await db
    .updateTable("pageReports")
    .set({ chapterId: into.id, pageId: mappedPage("pageId") })
    .where("chapterId", "=", from.id)
    .execute()

  await db
    .updateTable("readingRewards")
    .set({ chapterId: into.id })
    .where("chapterId", "=", from.id)
    .execute()

  // A reader notified of both copies keeps one notification.
  await db
    .deleteFrom("notifications as n")
    .where("n.chapterId", "=", from.id)
    .where((eb) =>
      eb.exists(
        eb
          .selectFrom("notifications as k")
          .select("k.id")
          .whereRef("k.userId", "=", "n.userId")
          .where("k.chapterId", "=", into.id),
      ),
    )
    .execute()
  await db
    .updateTable("notifications")
    .set({ chapterId: into.id })
    .where("chapterId", "=", from.id)
    .execute()
  await db.deleteFrom("notificationOutbox").where("chapterId", "=", from.id).execute()

  await mergeThreads(db, "chapterId", { fromId: from.id, intoId: into.id })

  await db
    .updateTable("chapters")
    .set({ deletedAt: new Date(), deleterId: actorId })
    .where("id", "=", from.id)
    .execute()
}

/**
 * Moves what readers keep about a duplicate to the media: library entries,
 * list items, reading rewards, the comment thread and a featured spot. A
 * reader who has both in their library keeps the most recently updated status,
 * and is notified when either was set to.
 */
export const mergeReaders = async (
  db: Kysely<DB>,
  { mediaId, duplicateId }: { mediaId: string; duplicateId: string },
) => {
  const kept = await db
    .deleteFrom("userLibraryEntries")
    .where("mediaId", "=", mediaId)
    .where(
      "userId",
      "in",
      db.selectFrom("userLibraryEntries").select("userId").where("mediaId", "=", duplicateId),
    )
    .returningAll()
    .execute()
  const entries = await db
    .deleteFrom("userLibraryEntries")
    .where("mediaId", "=", duplicateId)
    .returningAll()
    .execute()
  const keptBy = new Map(kept.map((row) => [row.userId, row]))
  const rows = entries.map((row): Selectable<UserLibraryEntry> => {
    const other = keptBy.get(row.userId)

    if (other === undefined) {
      return { ...row, mediaId }
    }

    return {
      userId: row.userId,
      mediaId,
      status: row.updatedAt.getTime() > other.updatedAt.getTime() ? row.status : other.status,
      notify: row.notify || other.notify,
      createdAt: earliest(row.createdAt, other.createdAt),
      updatedAt: latest(row.updatedAt, other.updatedAt),
    }
  })

  await insertInBatches(rows, (batch) =>
    db.insertInto("userLibraryEntries").values(batch).execute(),
  )

  await db
    .deleteFrom("userListItems as i")
    .where("i.mediaId", "=", duplicateId)
    .where((eb) =>
      eb.exists(
        eb
          .selectFrom("userListItems as k")
          .select("k.listId")
          .whereRef("k.listId", "=", "i.listId")
          .where("k.mediaId", "=", mediaId),
      ),
    )
    .execute()
  await db
    .updateTable("userListItems")
    .set({ mediaId })
    .where("mediaId", "=", duplicateId)
    .execute()

  await db
    .updateTable("readingRewards")
    .set({ mediaId })
    .where("mediaId", "=", duplicateId)
    .execute()

  await mergeThreads(db, "mediaId", { fromId: duplicateId, intoId: mediaId })

  const featured = await db
    .selectFrom("featuredMedias")
    .select("mediaId")
    .where("mediaId", "in", [mediaId, duplicateId])
    .execute()

  if (featured.some((row) => row.mediaId === duplicateId)) {
    await (featured.some((row) => row.mediaId === mediaId)
      ? db.deleteFrom("featuredMedias").where("mediaId", "=", duplicateId).execute()
      : db
          .updateTable("featuredMedias")
          .set({ mediaId })
          .where("mediaId", "=", duplicateId)
          .execute())
  }
}
