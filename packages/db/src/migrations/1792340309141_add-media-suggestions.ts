import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createType("MediaSuggestionStatus")
    .asEnum(["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"])
    .execute()

  await db.schema
    .createTable("mediaSuggestions")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("mediaId", "uuid", (c) =>
      c.notNull().references("medias.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("authorId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("status", sql`"MediaSuggestionStatus"`, (c) => c.notNull().defaultTo("PENDING"))
    .addColumn("changes", "jsonb", (c) => c.notNull())
    .addColumn("base", "jsonb", (c) => c.notNull())
    .addColumn("note", "text")
    .addColumn("acceptedFields", sql`text[]`, (c) => c.notNull().defaultTo(sql`'{}'::text[]`))
    .addColumn("reviewerId", "uuid", (c) =>
      c.references("users.id").onDelete("set null").onUpdate("cascade"),
    )
    .addColumn("reviewerNote", "text")
    .addColumn("reviewedAt", sql`timestamp(3)`)
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()

  await sql`
    CREATE UNIQUE INDEX "mediaSuggestions_pending_unique"
      ON "mediaSuggestions" ("mediaId", "authorId")
      WHERE "status" = 'PENDING'
  `.execute(db)

  await sql`
    CREATE INDEX "mediaSuggestions_pending_createdAt_idx"
      ON "mediaSuggestions" ("createdAt")
      WHERE "status" = 'PENDING'
  `.execute(db)

  await db.schema
    .createIndex("mediaSuggestions_authorId_createdAt_idx")
    .on("mediaSuggestions")
    .columns(["authorId", "createdAt"])
    .execute()

  await sql`
    CREATE TRIGGER "mediaSuggestions_set_updated_at"
    BEFORE UPDATE ON "mediaSuggestions"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at()
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable("mediaSuggestions").execute()
  await db.schema.dropType("MediaSuggestionStatus").execute()
}
