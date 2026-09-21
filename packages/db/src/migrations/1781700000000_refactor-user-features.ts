import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType("UserLibraryStatus")
    .asEnum(["READING", "REREADING", "PLAN_TO_READ", "COMPLETED", "ON_HOLD", "DROPPED"])
    .execute()

  await db.schema.createType("UserListVisibility").asEnum(["PUBLIC", "PRIVATE"]).execute()

  // Old placeholder shape: one row per user, six JSONB array columns.
  // Replaced by userLibraryEntries (one row per (user, media) with a status).
  await db.schema.dropTable("userLibraries").execute()

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

  // Old shape: (userId, mediaId) PK + JSONB progression array.
  // Replaced by per-chapter rows: opening a chapter upserts (userId, chapterId).
  await db.schema.dropTable("userHistories").execute()

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
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("deletedAt", sql`timestamp(3)`)
    .execute()

  await sql`
    CREATE INDEX "userLists_userId_idx"
      ON "userLists" ("userId")
      WHERE "deletedAt" IS NULL
  `.execute(db)

  await sql`
    CREATE TRIGGER "userLists_set_updated_at"
    BEFORE UPDATE ON "userLists"
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
}

export async function down(): Promise<void> {
  throw new Error("refactor-user-features cannot be reversed")
}
