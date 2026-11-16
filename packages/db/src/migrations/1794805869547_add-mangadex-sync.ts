import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createType("MangaDexSyncStatus")
    .asEnum(["PENDING", "RUNNING", "FINISHED", "FAILED", "CANCELLED"])
    .execute()

  await db.schema.createType("MangaDexSyncItemKind").asEnum(["COVER", "CHAPTER"]).execute()

  await db.schema
    .createType("MangaDexSyncItemStatus")
    .asEnum(["PENDING", "DONE", "SKIPPED", "FAILED"])
    .execute()

  await db.schema
    .createTable("mangaDexSyncs")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("finishedAt", sql`timestamp(3)`)
    .addColumn("mediaId", "uuid", (c) =>
      c.notNull().references("medias.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("mangaDexId", "uuid", (c) => c.notNull())
    .addColumn("status", sql`"MangaDexSyncStatus"`, (c) => c.notNull().defaultTo("PENDING"))
    .addColumn("error", "text")
    .addColumn("summary", "jsonb", (c) => c.notNull().defaultTo(sql`'{}'::jsonb`))
    .execute()

  await db.schema
    .createIndex("mangaDexSyncs_mediaId_createdAt_idx")
    .on("mangaDexSyncs")
    .columns(["mediaId", "createdAt"])
    .execute()

  // At most one sync per media is queued or running at a time.
  await sql`
    CREATE UNIQUE INDEX "mangaDexSyncs_mediaId_active_key" ON "mangaDexSyncs" ("mediaId")
    WHERE "status" IN ('PENDING', 'RUNNING')
  `.execute(db)

  await db.schema
    .createTable("mangaDexSyncItems")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("syncId", "uuid", (c) =>
      c.notNull().references("mangaDexSyncs.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("position", "integer", (c) => c.notNull())
    .addColumn("kind", sql`"MangaDexSyncItemKind"`, (c) => c.notNull())
    .addColumn("mangaDexId", "uuid", (c) => c.notNull())
    .addColumn("details", "jsonb", (c) => c.notNull())
    .addColumn("status", sql`"MangaDexSyncItemStatus"`, (c) => c.notNull().defaultTo("PENDING"))
    .addColumn("error", "text")
    .addColumn("entityId", "uuid")
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addUniqueConstraint("mangaDexSyncItems_syncId_position_key", ["syncId", "position"])
    .execute()

  // An imported cover or chapter is never imported again, even once deleted on Taiyō.
  await sql`
    CREATE INDEX "mangaDexSyncItems_imported_idx" ON "mangaDexSyncItems" ("kind", "mangaDexId")
    WHERE "status" = 'DONE'
  `.execute(db)
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("mangaDexSyncItems").execute()
  await db.schema.dropTable("mangaDexSyncs").execute()
  await db.schema.dropType("MangaDexSyncItemStatus").execute()
  await db.schema.dropType("MangaDexSyncItemKind").execute()
  await db.schema.dropType("MangaDexSyncStatus").execute()
}
