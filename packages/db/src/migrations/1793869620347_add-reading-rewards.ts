import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<unknown>) {
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
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable("readingRewards").execute()
}
