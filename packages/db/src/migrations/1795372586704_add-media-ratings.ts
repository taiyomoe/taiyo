import { type Kysely, sql } from "kysely"

type MigrationDb = {
  mediaRatings: {
    userId: string
    mediaId: string
    score: number
    createdAt: Date
    updatedAt: Date
  }
  mediaRatingStats: {
    mediaId: string
    ratingCount: number
    ratingSum: number
    scoreCounts: number[]
  }
}

export async function up(db: Kysely<MigrationDb>): Promise<void> {
  await db.schema
    .createTable("mediaRatings")
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("mediaId", "uuid", (c) =>
      c.notNull().references("medias.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("score", "smallint", (c) => c.notNull())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addPrimaryKeyConstraint("mediaRatings_pkey", ["userId", "mediaId"])
    .addCheckConstraint("mediaRatings_score_check", sql`"score" BETWEEN 1 AND 10`)
    .execute()

  await db.schema
    .createIndex("mediaRatings_mediaId_idx")
    .on("mediaRatings")
    .column("mediaId")
    .execute()

  await sql`
    CREATE TRIGGER "mediaRatings_set_updated_at"
    BEFORE UPDATE ON "mediaRatings"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at()
  `.execute(db)

  await db.schema
    .createTable("mediaRatingStats")
    .addColumn("mediaId", "uuid", (c) =>
      c.primaryKey().references("medias.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("ratingCount", "integer", (c) => c.notNull().defaultTo(0))
    .addColumn("ratingSum", "integer", (c) => c.notNull().defaultTo(0))
    .addColumn("scoreCounts", sql`integer[]`, (c) =>
      c.notNull().defaultTo(sql`'{0,0,0,0,0,0,0,0,0,0}'`),
    )
    .addCheckConstraint("mediaRatingStats_ratingCount_check", sql`"ratingCount" >= 0`)
    .addCheckConstraint(
      "mediaRatingStats_ratingSum_check",
      sql`"ratingSum" BETWEEN "ratingCount" AND 10 * "ratingCount"`,
    )
    .addCheckConstraint(
      "mediaRatingStats_scoreCounts_check",
      sql`cardinality("scoreCounts") = 10 AND 0 <= ALL ("scoreCounts")`,
    )
    .execute()

  await sql`
    CREATE TRIGGER "mediaRatingStats_enqueue_search_outbox"
    AFTER INSERT OR UPDATE OR DELETE ON "mediaRatingStats"
    FOR EACH ROW
    EXECUTE FUNCTION search_outbox_enqueue_media_reference()
  `.execute(db)
}

export async function down(db: Kysely<MigrationDb>): Promise<void> {
  await db.schema.dropTable("mediaRatingStats").execute()
  await db.schema.dropTable("mediaRatings").execute()
}
