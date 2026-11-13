import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable("pushSubscriptions")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("endpoint", "text", (c) => c.notNull().unique())
    .addColumn("p256dh", "text", (c) => c.notNull())
    .addColumn("auth", "text", (c) => c.notNull())
    .addColumn("userAgent", "text")
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()

  await db.schema
    .createIndex("pushSubscriptions_userId_idx")
    .on("pushSubscriptions")
    .column("userId")
    .execute()

  await sql`
    CREATE TRIGGER "pushSubscriptions_set_updated_at"
    BEFORE UPDATE ON "pushSubscriptions"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at()
  `.execute(db)

  await db.schema
    .alterTable("notifications")
    .addColumn("pushedAt", sql`timestamp(3)`)
    .execute()
  await sql`UPDATE "notifications" SET "pushedAt" = CURRENT_TIMESTAMP`.execute(db)
  await sql`
    CREATE INDEX "notifications_unpushed_idx"
      ON "notifications" ("createdAt")
      WHERE "pushedAt" IS NULL
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await sql`DROP INDEX "notifications_unpushed_idx"`.execute(db)
  await db.schema.alterTable("notifications").dropColumn("pushedAt").execute()
  await db.schema.dropTable("pushSubscriptions").execute()
}
