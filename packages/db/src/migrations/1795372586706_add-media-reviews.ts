import { type Kysely, sql } from "kysely"

type MigrationDb = {
  mediaReviews: {
    id: string
    userId: string
    mediaId: string
    body: string
    containsSpoilers: boolean
    helpfulCount: number
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    deleterId: string | null
  }
  mediaReviewVotes: { userId: string; reviewId: string; createdAt: Date }
  mediaReviewReports: {
    id: string
    reviewId: string
    reporterId: string
    reason: string
    details: string | null
    status: string
    resolverId: string | null
    resolvedAt: Date | null
    createdAt: Date
  }
}

export async function up(db: Kysely<MigrationDb>): Promise<void> {
  await db.schema
    .createTable("mediaReviews")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("mediaId", "uuid", (c) =>
      c.notNull().references("medias.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("body", "text", (c) => c.notNull())
    .addColumn("containsSpoilers", "boolean", (c) => c.notNull().defaultTo(false))
    .addColumn("helpfulCount", "integer", (c) => c.notNull().defaultTo(0))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("deletedAt", sql`timestamp(3)`)
    .addColumn("deleterId", "uuid", (c) =>
      c.references("users.id").onDelete("set null").onUpdate("cascade"),
    )
    .addCheckConstraint("mediaReviews_body_check", sql`char_length("body") BETWEEN 200 AND 10000`)
    .addCheckConstraint("mediaReviews_helpfulCount_check", sql`"helpfulCount" >= 0`)
    .execute()

  await db.schema
    .createIndex("mediaReviews_userId_mediaId_key")
    .unique()
    .on("mediaReviews")
    .columns(["userId", "mediaId"])
    .where(sql.ref("deletedAt"), "is", null)
    .execute()

  await db.schema
    .createIndex("mediaReviews_mediaId_newest_idx")
    .on("mediaReviews")
    .columns(["mediaId", "createdAt desc", "id desc"])
    .where(sql.ref("deletedAt"), "is", null)
    .execute()

  await db.schema
    .createIndex("mediaReviews_mediaId_helpful_idx")
    .on("mediaReviews")
    .columns(["mediaId", "helpfulCount desc", "createdAt desc", "id desc"])
    .where(sql.ref("deletedAt"), "is", null)
    .execute()

  await db.schema
    .createIndex("mediaReviews_userId_createdAt_idx")
    .on("mediaReviews")
    .columns(["userId", "createdAt desc"])
    .execute()

  await db.schema
    .createTable("mediaReviewVotes")
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("reviewId", "uuid", (c) =>
      c.notNull().references("mediaReviews.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addPrimaryKeyConstraint("mediaReviewVotes_pkey", ["userId", "reviewId"])
    .execute()

  await db.schema
    .createIndex("mediaReviewVotes_reviewId_idx")
    .on("mediaReviewVotes")
    .column("reviewId")
    .execute()

  await db.schema
    .createTable("mediaReviewReports")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("reviewId", "uuid", (c) =>
      c.notNull().references("mediaReviews.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("reporterId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("reason", sql`"CommentReportReason"`, (c) => c.notNull())
    .addColumn("details", "text", (c) => c.check(sql`char_length("details") <= 500`))
    .addColumn("status", sql`"CommentReportStatus"`, (c) => c.notNull().defaultTo("OPEN"))
    .addColumn("resolverId", "uuid", (c) =>
      c.references("users.id").onDelete("set null").onUpdate("cascade"),
    )
    .addColumn("resolvedAt", sql`timestamp(3)`)
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()

  await db.schema
    .createIndex("mediaReviewReports_open_reporter_review_key")
    .unique()
    .on("mediaReviewReports")
    .columns(["reporterId", "reviewId"])
    .where(sql.ref("status"), "=", "OPEN")
    .execute()

  await db.schema
    .createIndex("mediaReviewReports_status_createdAt_idx")
    .on("mediaReviewReports")
    .columns(["status", "createdAt"])
    .execute()

  await db.schema
    .createIndex("mediaReviewReports_reviewId_idx")
    .on("mediaReviewReports")
    .column("reviewId")
    .execute()
}

export async function down(db: Kysely<MigrationDb>): Promise<void> {
  await db.schema.dropTable("mediaReviewReports").execute()
  await db.schema.dropTable("mediaReviewVotes").execute()
  await db.schema.dropTable("mediaReviews").execute()
}
