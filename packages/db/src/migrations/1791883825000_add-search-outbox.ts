import { type Kysely, sql } from "kysely"

const MEDIA_REFERENCING_TABLES = [
  "titles",
  "covers",
  "mediaStaffs",
  "chapters",
  "userLibraryEntries",
]

export async function up(db: Kysely<unknown>): Promise<void> {
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

  for (const table of MEDIA_REFERENCING_TABLES) {
    await sql`
      CREATE TRIGGER ${sql.id(`${table}_enqueue_search_outbox`)}
      AFTER INSERT OR UPDATE OR DELETE ON ${sql.id(table)}
      FOR EACH ROW
      EXECUTE FUNCTION search_outbox_enqueue_media_reference()
    `.execute(db)
  }

  await sql`
    CREATE TRIGGER "staffs_enqueue_search_outbox"
    AFTER UPDATE OR DELETE ON "staffs"
    FOR EACH ROW
    EXECUTE FUNCTION search_outbox_enqueue_staff_medias()
  `.execute(db)
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`DROP TRIGGER "staffs_enqueue_search_outbox" ON "staffs"`.execute(db)

  for (const table of MEDIA_REFERENCING_TABLES) {
    await sql`DROP TRIGGER ${sql.id(`${table}_enqueue_search_outbox`)} ON ${sql.id(table)}`.execute(
      db,
    )
  }

  await sql`DROP TRIGGER "medias_enqueue_search_outbox" ON "medias"`.execute(db)
  await sql`DROP FUNCTION search_outbox_enqueue_staff_medias()`.execute(db)
  await sql`DROP FUNCTION search_outbox_enqueue_media_reference()`.execute(db)
  await sql`DROP FUNCTION search_outbox_enqueue_media()`.execute(db)
  await db.schema.dropTable("searchOutbox").execute()
}
