import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<unknown>): Promise<void> {
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
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("featuredMedias").execute()
}
