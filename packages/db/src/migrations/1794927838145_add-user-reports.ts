import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createType("UserReportReason")
    .asEnum(["INAPPROPRIATE_PROFILE", "IMPERSONATION", "HARASSMENT", "SPAM", "OTHER"])
    .execute()

  await db.schema
    .createType("UserReportStatus")
    .asEnum(["PENDING", "RESOLVED", "DISMISSED"])
    .execute()

  await db.schema
    .createTable("userReports")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("reporterId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("reason", sql`"UserReportReason"`, (c) => c.notNull())
    .addColumn("details", "text")
    .addColumn("status", sql`"UserReportStatus"`, (c) => c.notNull().defaultTo("PENDING"))
    .addColumn("reviewerId", "uuid", (c) =>
      c.references("users.id").onDelete("set null").onUpdate("cascade"),
    )
    .addColumn("reviewerNote", "text")
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()

  // A reporter has at most one pending report per user.
  await sql`
    CREATE UNIQUE INDEX "userReports_pending_unique"
      ON "userReports" ("userId", "reporterId")
      WHERE "status" = 'PENDING'
  `.execute(db)

  await db.schema
    .createIndex("userReports_status_createdAt_idx")
    .on("userReports")
    .columns(["status", "createdAt"])
    .execute()

  await sql`
    CREATE TRIGGER "userReports_set_updated_at"
    BEFORE UPDATE ON "userReports"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at()
  `.execute(db)
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("userReports").execute()
  await db.schema.dropType("UserReportStatus").execute()
  await db.schema.dropType("UserReportReason").execute()
}
