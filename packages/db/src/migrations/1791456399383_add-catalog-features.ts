import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("covers")
    .addColumn("extension", "text", (c) => c.notNull().defaultTo("jpg"))
    .execute()

  await db.schema
    .alterTable("covers")
    .addCheckConstraint("covers_extension_check", sql`"extension" IN ('jpg', 'gif')`)
    .execute()

  await db.schema
    .alterTable("banners")
    .addColumn("extension", "text", (c) => c.notNull().defaultTo("jpg"))
    .execute()

  await db.schema
    .alterTable("banners")
    .addCheckConstraint("banners_extension_check", sql`"extension" IN ('jpg', 'gif')`)
    .execute()

  await db.schema
    .createTable("searchOutbox")
    .addColumn("id", "bigint", (c) => c.primaryKey().generatedAlwaysAsIdentity())
    .addColumn("mediaId", "uuid", (c) => c.notNull())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()

  await sql`
    CREATE FUNCTION search_outbox_enqueue_media() RETURNS trigger AS $$
    BEGIN
      IF TG_OP = 'DELETE' THEN
        INSERT INTO "searchOutbox" ("mediaId") VALUES (OLD.id);
      ELSE
        INSERT INTO "searchOutbox" ("mediaId") VALUES (NEW.id);
      END IF;

      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql
  `.execute(db)

  await sql`
    CREATE FUNCTION search_outbox_enqueue_media_reference() RETURNS trigger AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        INSERT INTO "searchOutbox" ("mediaId") VALUES (NEW."mediaId");
      ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO "searchOutbox" ("mediaId") VALUES (OLD."mediaId");
      ELSE
        INSERT INTO "searchOutbox" ("mediaId") VALUES (OLD."mediaId");

        IF NEW."mediaId" IS DISTINCT FROM OLD."mediaId" THEN
          INSERT INTO "searchOutbox" ("mediaId") VALUES (NEW."mediaId");
        END IF;
      END IF;

      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql
  `.execute(db)

  await sql`
    CREATE FUNCTION search_outbox_enqueue_staff_medias() RETURNS trigger AS $$
    BEGIN
      INSERT INTO "searchOutbox" ("mediaId")
      SELECT "mediaId" FROM "mediaStaffs" WHERE "staffId" = OLD.id;

      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql
  `.execute(db)

  await sql`
    CREATE TRIGGER "medias_enqueue_search_outbox"
    AFTER INSERT OR UPDATE OR DELETE ON "medias"
    FOR EACH ROW
    EXECUTE FUNCTION search_outbox_enqueue_media()
  `.execute(db)

  await sql`
    CREATE TRIGGER "titles_enqueue_search_outbox"
    AFTER INSERT OR UPDATE OR DELETE ON "titles"
    FOR EACH ROW
    EXECUTE FUNCTION search_outbox_enqueue_media_reference()
  `.execute(db)

  await sql`
    CREATE TRIGGER "covers_enqueue_search_outbox"
    AFTER INSERT OR UPDATE OR DELETE ON "covers"
    FOR EACH ROW
    EXECUTE FUNCTION search_outbox_enqueue_media_reference()
  `.execute(db)

  await sql`
    CREATE TRIGGER "mediaStaffs_enqueue_search_outbox"
    AFTER INSERT OR UPDATE OR DELETE ON "mediaStaffs"
    FOR EACH ROW
    EXECUTE FUNCTION search_outbox_enqueue_media_reference()
  `.execute(db)

  await sql`
    CREATE TRIGGER "chapters_enqueue_search_outbox"
    AFTER INSERT OR UPDATE OR DELETE ON "chapters"
    FOR EACH ROW
    EXECUTE FUNCTION search_outbox_enqueue_media_reference()
  `.execute(db)

  await sql`
    CREATE TRIGGER "userLibraryEntries_enqueue_search_outbox"
    AFTER INSERT OR UPDATE OR DELETE ON "userLibraryEntries"
    FOR EACH ROW
    EXECUTE FUNCTION search_outbox_enqueue_media_reference()
  `.execute(db)

  await sql`
    CREATE TRIGGER "staffs_enqueue_search_outbox"
    AFTER UPDATE OR DELETE ON "staffs"
    FOR EACH ROW
    EXECUTE FUNCTION search_outbox_enqueue_staff_medias()
  `.execute(db)

  await db.schema
    .createTable("featuredMedias")
    .addColumn("mediaId", "uuid", (c) =>
      c.primaryKey().references("medias.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("position", "integer", (c) => c.notNull())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()

  await db.schema
    .createIndex("featuredMedias_position_idx")
    .on("featuredMedias")
    .column("position")
    .execute()

  await sql`
    CREATE TRIGGER "featuredMedias_set_updated_at"
    BEFORE UPDATE ON "featuredMedias"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at()
  `.execute(db)

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

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("mediaSuggestions").execute()

  await db.schema.dropType("MediaSuggestionStatus").execute()

  await db.schema.dropTable("featuredMedias").execute()

  await sql`DROP TRIGGER "staffs_enqueue_search_outbox" ON "staffs"`.execute(db)

  await sql`DROP TRIGGER "titles_enqueue_search_outbox" ON "titles"`.execute(db)

  await sql`DROP TRIGGER "covers_enqueue_search_outbox" ON "covers"`.execute(db)

  await sql`DROP TRIGGER "mediaStaffs_enqueue_search_outbox" ON "mediaStaffs"`.execute(db)

  await sql`DROP TRIGGER "chapters_enqueue_search_outbox" ON "chapters"`.execute(db)

  await sql`DROP TRIGGER "userLibraryEntries_enqueue_search_outbox" ON "userLibraryEntries"`.execute(
    db,
  )

  await sql`DROP TRIGGER "medias_enqueue_search_outbox" ON "medias"`.execute(db)

  await sql`DROP FUNCTION search_outbox_enqueue_staff_medias()`.execute(db)

  await sql`DROP FUNCTION search_outbox_enqueue_media_reference()`.execute(db)

  await sql`DROP FUNCTION search_outbox_enqueue_media()`.execute(db)

  await db.schema.dropTable("searchOutbox").execute()

  await db.schema.alterTable("covers").dropConstraint("covers_extension_check").execute()

  await db.schema.alterTable("covers").dropColumn("extension").execute()

  await db.schema.alterTable("banners").dropConstraint("banners_extension_check").execute()

  await db.schema.alterTable("banners").dropColumn("extension").execute()
}
