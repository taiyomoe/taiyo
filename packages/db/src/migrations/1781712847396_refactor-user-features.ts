import { type Kysely, sql } from "kysely"
import { cluster } from "radashi"

// Readers: libraries, reading history and lists (carried over from production), reading
// rewards and the points they earned, page bookmarks and page reports.

type LibraryColumn = "reading" | "rereading" | "planToRead" | "completed" | "onHold" | "dropped"
type RefactorUserFeaturesDb = {
  medias: { id: string }
  chapters: { id: string }
  userLibraries: Record<LibraryColumn, unknown[] | null> & { userId: string }
  legacyUserHistories: { userId: string; progression: unknown[] | null }
  userLibraryEntries: {
    userId: string
    mediaId: string
    status: string
    createdAt: Date
    updatedAt: Date
  }
  userHistories: {
    userId: string
    chapterId: string
    pageId: string | null
    completed: boolean
    createdAt: Date
    updatedAt: Date
  }
}
type LibraryEntry = RefactorUserFeaturesDb["userLibraryEntries"]
type HistoryEntry = RefactorUserFeaturesDb["userHistories"]

const LIBRARY_STATUSES = [
  ["reading", "READING"],
  ["rereading", "REREADING"],
  ["planToRead", "PLAN_TO_READ"],
  ["completed", "COMPLETED"],
  ["onHold", "ON_HOLD"],
  ["dropped", "DROPPED"],
] as const satisfies ReadonlyArray<readonly [LibraryColumn, string]>
const BATCH_SIZE = 1000
const READERS_PER_BATCH = 500
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// The legacy JSONB arrays hold { mediaId, updatedAt } (libraries) and
// { chapterId, pageId, completed, updatedAt } (histories). Unreadable values are skipped.
const field = (json: unknown, key: string): unknown => {
  const value: unknown = typeof json === "string" ? JSON.parse(json) : json

  return typeof value === "object" && value !== null ? Reflect.get(value, key) : undefined
}
const toUuid = (value: unknown) =>
  typeof value === "string" && UUID_PATTERN.test(value) ? value.toLowerCase() : null
const toDate = (value: unknown) => {
  const date = typeof value === "string" ? new Date(value) : null

  return date !== null && !Number.isNaN(date.getTime()) ? date : new Date()
}

type AddReadingRewardsDb = {
  userHistories: { userId: string; chapterId: string; completed: boolean; updatedAt: Date }
  chapters: { id: string; mediaId: string; number: number; pages: unknown; uploaderId: string }
  userProfiles: { userId: string; points: number }
  readingRewards: {
    userId: string
    chapterId: string
    mediaId: string
    number: number
    pages: number
    points: number
    createdAt: Date
  }
  // Temporary table staging each reader's earned points for one UPDATE.
  earnedPoints: { userId: string; points: number }
}
type Reward = AddReadingRewardsDb["readingRewards"]
type Read = {
  userId: string
  chapterId: string
  mediaId: string
  number: number
  pageCount: number
  updatedAt: Date
}

// Same rules as apps/api/src/handlers/update-chapter-history-handler.ts when this migration
// was written: completing a chapter someone else uploaded credits its unclaimed pages,
// within SECONDS_PER_PAGE since the reader's previous reward and DAILY_PAGE_LIMIT over a
// rolling day, and every PAGES_PER_POINT pages read make a point.
const SECONDS_PER_PAGE = 2
const PAGES_PER_POINT = 20
const DAILY_PAGE_LIMIT = 1200
const DAY_MS = 86_400_000
// Replays one batch of reads, ordered by reader then time, as if each had been completed
// live. The legacy history has no opening time, so a reader's first reward is only capped
// by the chapter's pages and the daily limit.
const replayReads = (reads: Read[]) => {
  const rewards: Reward[] = []
  const earned = new Map<string, number>()
  let readerId: string | null = null
  let total = 0
  let lastRewardAt: number | null = null
  let claimed = new Map<string, number>()
  let lastDay: Array<{ at: number; pages: number }> = []

  for (const read of reads) {
    if (read.userId !== readerId) {
      readerId = read.userId
      total = 0
      lastRewardAt = null
      claimed = new Map()
      lastDay = []
    }

    const at = read.updatedAt.getTime()

    lastDay = lastDay.filter((reward) => reward.at > at - DAY_MS)

    const chapterKey = `${read.mediaId}:${read.number}`
    const today = lastDay.reduce((sum, reward) => sum + reward.pages, 0)
    const elapsedSeconds = lastRewardAt === null ? Infinity : (at - lastRewardAt) / 1000
    const pages = Math.min(
      read.pageCount - (claimed.get(chapterKey) ?? 0),
      Math.floor(elapsedSeconds / SECONDS_PER_PAGE),
      DAILY_PAGE_LIMIT - today,
    )

    if (pages <= 0) {
      continue
    }

    const points =
      Math.floor((total + pages) / PAGES_PER_POINT) - Math.floor(total / PAGES_PER_POINT)

    rewards.push({
      userId: read.userId,
      chapterId: read.chapterId,
      mediaId: read.mediaId,
      number: read.number,
      pages,
      points,
      createdAt: read.updatedAt,
    })
    total += pages
    lastRewardAt = at
    claimed.set(chapterKey, (claimed.get(chapterKey) ?? 0) + pages)
    lastDay.push({ at, pages })
    earned.set(read.userId, (earned.get(read.userId) ?? 0) + points)
  }

  return { rewards, earned }
}

type MigrationDb = RefactorUserFeaturesDb & AddReadingRewardsDb

export async function up(db: Kysely<MigrationDb>): Promise<void> {
  // refactor-user-features
  await db.schema
    .createType("UserLibraryStatus")
    .asEnum(["READING", "REREADING", "PLAN_TO_READ", "COMPLETED", "ON_HOLD", "DROPPED"])
    .execute()

  await db.schema.createType("UserListVisibility").asEnum(["PUBLIC", "PRIVATE"]).execute()

  // Old shape: one row per user, six JSONB array columns of { mediaId, updatedAt }.
  // Replaced by userLibraryEntries (one row per (user, media) with a status).
  await db.schema
    .createTable("userLibraryEntries")
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("mediaId", "uuid", (c) =>
      c.notNull().references("medias.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("status", sql`"UserLibraryStatus"`, (c) => c.notNull())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addPrimaryKeyConstraint("userLibraryEntries_pkey", ["userId", "mediaId"])
    .execute()

  // Production holds 70k entries for 11k users. Computed here rather than in one
  // INSERT … SELECT: inside the long migration transaction, Postgres planned that query to
  // run for hours. A media listed under several statuses keeps the most recently updated
  // one; medias deleted since are skipped.
  const mediaIds = new Set((await db.selectFrom("medias").select("id").execute()).map((m) => m.id))
  const libraries = await db.selectFrom("userLibraries").selectAll().execute()
  const libraryEntries = new Map<string, LibraryEntry>()

  for (const library of libraries) {
    for (const [column, status] of LIBRARY_STATUSES) {
      for (const raw of library[column] ?? []) {
        const mediaId = toUuid(field(raw, "mediaId"))

        if (mediaId === null || !mediaIds.has(mediaId)) {
          continue
        }

        const updatedAt = toDate(field(raw, "updatedAt"))
        const key = `${library.userId}:${mediaId}`
        const existing = libraryEntries.get(key)

        if (existing === undefined || updatedAt > existing.updatedAt) {
          libraryEntries.set(key, {
            userId: library.userId,
            mediaId,
            status,
            createdAt: updatedAt,
            updatedAt,
          })
        }
      }
    }
  }

  for (const batch of cluster([...libraryEntries.values()], BATCH_SIZE)) {
    await db.insertInto("userLibraryEntries").values(batch).execute()
  }

  await db.schema.dropTable("userLibraries").execute()

  await db.schema
    .createIndex("userLibraryEntries_userId_status_updatedAt_idx")
    .on("userLibraryEntries")
    .columns(["userId", "status", "updatedAt desc"])
    .execute()

  await db.schema
    .createIndex("userLibraryEntries_mediaId_idx")
    .on("userLibraryEntries")
    .column("mediaId")
    .execute()

  await sql`
    CREATE TRIGGER "userLibraryEntries_set_updated_at"
    BEFORE UPDATE ON "userLibraryEntries"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at()
  `.execute(db)

  // Old shape: one row per (userId, mediaId) + a JSONB progression array of
  // { chapterId, pageId, completed, updatedAt }. Replaced by per-chapter rows: opening a
  // chapter upserts (userId, chapterId). Kept aside until its rows are carried over.
  await db.schema.alterTable("userHistories").renameTo("legacyUserHistories").execute()

  // Frees its name for the new table's foreign key, which Postgres would otherwise call
  // "userHistories_userId_fkey1".
  await db.schema
    .alterTable("legacyUserHistories")
    .dropConstraint("userHistories_userId_fkey")
    .execute()

  await db.schema
    .createTable("userHistories")
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("chapterId", "uuid", (c) =>
      c.notNull().references("chapters.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("pageId", "uuid")
    .addColumn("completed", "boolean", (c) => c.notNull().defaultTo(false))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addPrimaryKeyConstraint("userHistories_pkey", ["userId", "chapterId"])
    .execute()

  // Production holds 1.6M chapter reads (255 MB of JSON), read a batch of readers at a
  // time. A chapter read twice keeps its latest progress; chapters deleted since are skipped.
  const chapterIds = new Set(
    (await db.selectFrom("chapters").select("id").execute()).map((c) => c.id),
  )
  const historyReaders = await db
    .selectFrom("legacyUserHistories")
    .select("userId")
    .distinct()
    .execute()

  await db.schema
    .createIndex("legacyUserHistories_userId_idx")
    .on("legacyUserHistories")
    .column("userId")
    .execute()

  for (const readerIds of cluster(
    historyReaders.map((historyReader) => historyReader.userId),
    READERS_PER_BATCH,
  )) {
    const rows = await db
      .selectFrom("legacyUserHistories")
      .select(["userId", "progression"])
      .where("userId", "in", readerIds)
      .execute()
    const historyEntries = new Map<string, HistoryEntry>()

    for (const row of rows) {
      for (const raw of row.progression ?? []) {
        const chapterId = toUuid(field(raw, "chapterId"))

        if (chapterId === null || !chapterIds.has(chapterId)) {
          continue
        }

        const updatedAt = toDate(field(raw, "updatedAt"))
        const key = `${row.userId}:${chapterId}`
        const existing = historyEntries.get(key)
        const completed = field(raw, "completed")

        if (existing === undefined || updatedAt > existing.updatedAt) {
          historyEntries.set(key, {
            userId: row.userId,
            chapterId,
            pageId: toUuid(field(raw, "pageId")),
            completed: completed === true || completed === "true",
            createdAt: updatedAt,
            updatedAt,
          })
        }
      }
    }

    for (const batch of cluster([...historyEntries.values()], BATCH_SIZE)) {
      await db.insertInto("userHistories").values(batch).execute()
    }
  }

  await db.schema.dropTable("legacyUserHistories").execute()

  await db.schema
    .createIndex("userHistories_userId_updatedAt_idx")
    .on("userHistories")
    .columns(["userId", "updatedAt desc"])
    .execute()

  await sql`
    CREATE TRIGGER "userHistories_set_updated_at"
    BEFORE UPDATE ON "userHistories"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at()
  `.execute(db)

  await db.schema
    .createTable("userLists")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("description", "text")
    .addColumn("visibility", sql`"UserListVisibility"`, (c) => c.notNull().defaultTo("PRIVATE"))
    .addColumn("upvoteCount", "integer", (c) => c.notNull().defaultTo(0))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("deletedAt", sql`timestamp(3)`)
    .addCheckConstraint("userLists_upvoteCount_check", sql`"upvoteCount" >= 0`)
    .execute()

  await sql`
    CREATE INDEX "userLists_userId_idx"
      ON "userLists" ("userId")
      WHERE "deletedAt" IS NULL
  `.execute(db)

  await sql`
    CREATE INDEX "userLists_top_idx"
      ON "userLists" ("upvoteCount" DESC, "createdAt" DESC, "id" DESC)
      WHERE "deletedAt" IS NULL AND "visibility" = 'PUBLIC'
  `.execute(db)

  // Votes bump upvoteCount and item edits touch updatedAt explicitly, so only metadata edits fire this.
  await sql`
    CREATE TRIGGER "userLists_set_updated_at"
    BEFORE UPDATE OF "name", "description", "visibility" ON "userLists"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at()
  `.execute(db)

  await db.schema
    .createTable("userListItems")
    .addColumn("listId", "uuid", (c) =>
      c.notNull().references("userLists.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("mediaId", "uuid", (c) =>
      c.notNull().references("medias.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("position", "integer", (c) => c.notNull())
    .addColumn("addedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addPrimaryKeyConstraint("userListItems_pkey", ["listId", "mediaId"])
    .execute()

  await db.schema
    .createIndex("userListItems_listId_position_idx")
    .on("userListItems")
    .columns(["listId", "position"])
    .execute()

  await db.schema
    .createTable("userListVotes")
    .addColumn("listId", "uuid", (c) =>
      c.notNull().references("userLists.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addPrimaryKeyConstraint("userListVotes_pkey", ["listId", "userId"])
    .execute()

  await db.schema
    .createIndex("userListVotes_userId_idx")
    .on("userListVotes")
    .column("userId")
    .execute()

  // add-reading-rewards
  await db.schema
    .createTable("readingRewards")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("chapterId", "uuid", (c) =>
      c.notNull().references("chapters.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("mediaId", "uuid", (c) =>
      c.notNull().references("medias.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("number", "double precision", (c) => c.notNull())
    .addColumn("pages", "integer", (c) => c.notNull().check(sql`"pages" > 0`))
    .addColumn("points", "integer", (c) => c.notNull().check(sql`"points" >= 0`))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()

  // Rewards the reading history carried over from production (1.6M chapter reads), with
  // the rules readers would have met live. Done before the indexes exist, so inserts stay
  // cheap. No joins: inside the long migration transaction, Postgres planned them to run
  // for hours, so chapters are looked up in memory and histories read by primary key.
  // Readers without a profile earn nothing, like at runtime.
  const chapters = new Map(
    (
      await db
        .selectFrom("chapters")
        .select((eb) => [
          "id",
          "mediaId",
          "number",
          "uploaderId",
          eb.fn.coalesce(eb.fn<number>("cardinality", ["pages"]), eb.lit(0)).as("pageCount"),
        ])
        .execute()
    ).map((chapter) => [chapter.id, chapter]),
  )
  const profiles = new Set(
    (await db.selectFrom("userProfiles").select("userId").execute()).map((p) => p.userId),
  )
  const readers = (
    await db
      .selectFrom("userHistories")
      .select("userId")
      .distinct()
      .where("completed", "=", true)
      .execute()
  ).filter((reader) => profiles.has(reader.userId))
  const earnedPoints: Array<{ userId: string; points: number }> = []

  for (const readerIds of cluster(
    readers.map((reader) => reader.userId),
    READERS_PER_BATCH,
  )) {
    const histories = await db
      .selectFrom("userHistories")
      .select(["userId", "chapterId", "updatedAt"])
      .where("userId", "in", readerIds)
      .where("completed", "=", true)
      .orderBy("userId")
      .orderBy("updatedAt")
      .orderBy("chapterId")
      .execute()
    const reads = histories.flatMap((history) => {
      const chapter = chapters.get(history.chapterId)

      return chapter === undefined || chapter.uploaderId === history.userId
        ? []
        : [
            {
              userId: history.userId,
              chapterId: history.chapterId,
              mediaId: chapter.mediaId,
              number: chapter.number,
              pageCount: chapter.pageCount,
              updatedAt: history.updatedAt,
            },
          ]
    })
    const { rewards, earned } = replayReads(reads)

    for (const batch of cluster(rewards, BATCH_SIZE)) {
      await db.insertInto("readingRewards").values(batch).execute()
    }

    for (const [userId, points] of earned) {
      if (points > 0) {
        earnedPoints.push({ userId, points })
      }
    }
  }

  // Added to the points already on the profile.
  await db.schema
    .createTable("earnedPoints")
    .temporary()
    .addColumn("userId", "uuid", (c) => c.primaryKey())
    .addColumn("points", "integer", (c) => c.notNull())
    .execute()

  for (const batch of cluster(earnedPoints, BATCH_SIZE)) {
    await db.insertInto("earnedPoints").values(batch).execute()
  }

  // Inside the migration transaction, autovacuum cannot refresh the planner's statistics
  // on these freshly written tables, which the join below relies on.
  await sql`ANALYZE "earnedPoints", "userProfiles"`.execute(db)

  await db
    .updateTable("userProfiles")
    .from("earnedPoints")
    .set((eb) => ({ points: eb("userProfiles.points", "+", eb.ref("earnedPoints.points")) }))
    .whereRef("userProfiles.userId", "=", "earnedPoints.userId")
    .execute()

  await db.schema.dropTable("earnedPoints").execute()

  await db.schema
    .createIndex("readingRewards_userId_createdAt_idx")
    .on("readingRewards")
    .columns(["userId", "createdAt desc"])
    .execute()

  await db.schema
    .createIndex("readingRewards_userId_mediaId_number_idx")
    .on("readingRewards")
    .columns(["userId", "mediaId", "number"])
    .execute()

  // add-reader-extras
  await db.schema.alterTable("users").addColumn("readerSettings", "jsonb").execute()

  await db.schema
    .createTable("pageBookmarks")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("chapterId", "uuid", (c) =>
      c.notNull().references("chapters.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("pageId", "uuid", (c) => c.notNull())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addUniqueConstraint("pageBookmarks_userId_chapterId_pageId_key", [
      "userId",
      "chapterId",
      "pageId",
    ])
    .execute()

  await db.schema
    .createIndex("pageBookmarks_userId_createdAt_idx")
    .on("pageBookmarks")
    .columns(["userId", "createdAt desc"])
    .execute()

  await db.schema
    .createType("PageReportReason")
    .asEnum(["BROKEN", "WRONG_ORDER", "WRONG_CHAPTER", "LOW_QUALITY", "OTHER"])
    .execute()

  await db.schema.createType("PageReportStatus").asEnum(["OPEN", "RESOLVED", "DISMISSED"]).execute()

  await db.schema
    .createTable("pageReports")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("reporterId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("chapterId", "uuid", (c) =>
      c.notNull().references("chapters.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("pageId", "uuid", (c) => c.notNull())
    .addColumn("reason", sql`"PageReportReason"`, (c) => c.notNull())
    .addColumn("comment", "text", (c) => c.check(sql`char_length("comment") <= 500`))
    .addColumn("status", sql`"PageReportStatus"`, (c) => c.notNull().defaultTo("OPEN"))
    .addColumn("resolverId", "uuid", (c) =>
      c.references("users.id").onDelete("set null").onUpdate("cascade"),
    )
    .addColumn("resolvedAt", sql`timestamp(3)`)
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()

  await sql`CREATE UNIQUE INDEX "pageReports_open_reporter_page_key" ON "pageReports" ("reporterId", "chapterId", "pageId") WHERE "status" = 'OPEN'`.execute(
    db,
  )

  await db.schema
    .createIndex("pageReports_status_createdAt_idx")
    .on("pageReports")
    .columns(["status", "createdAt"])
    .execute()

  await db.schema
    .createIndex("pageReports_chapterId_idx")
    .on("pageReports")
    .column("chapterId")
    .execute()
}

export function down(): Promise<void> {
  return Promise.reject(
    new Error("refactor-user-features cannot be reversed: refactor-user-features destroy data"),
  )
}
