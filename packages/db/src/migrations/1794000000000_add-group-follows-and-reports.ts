import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable("groupFollows")
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("groupId", "uuid", (c) =>
      c.notNull().references("groups.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addPrimaryKeyConstraint("groupFollows_pkey", ["userId", "groupId"])
    .execute()

  await db.schema
    .createIndex("groupFollows_groupId_idx")
    .on("groupFollows")
    .column("groupId")
    .execute()

  await db.schema
    .createType("GroupReportReason")
    .asEnum(["IMPERSONATION", "STOLEN_WORK", "SPAM", "OTHER"])
    .execute()

  await db.schema
    .createType("GroupReportStatus")
    .asEnum(["PENDING", "RESOLVED", "DISMISSED"])
    .execute()

  await db.schema
    .createTable("groupReports")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("groupId", "uuid", (c) =>
      c.notNull().references("groups.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("reporterId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("reason", sql`"GroupReportReason"`, (c) => c.notNull())
    .addColumn("details", "text")
    .addColumn("status", sql`"GroupReportStatus"`, (c) => c.notNull().defaultTo("PENDING"))
    .addColumn("reviewerId", "uuid", (c) =>
      c.references("users.id").onDelete("set null").onUpdate("cascade"),
    )
    .addColumn("reviewerNote", "text")
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()

  await sql`
    CREATE UNIQUE INDEX "groupReports_pending_unique"
      ON "groupReports" ("groupId", "reporterId")
      WHERE "status" = 'PENDING'
  `.execute(db)

  await db.schema
    .createIndex("groupReports_status_createdAt_idx")
    .on("groupReports")
    .columns(["status", "createdAt"])
    .execute()

  await sql`
    CREATE TRIGGER "groupReports_set_updated_at"
    BEFORE UPDATE ON "groupReports"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at()
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable("groupReports").execute()
  await db.schema.dropType("GroupReportStatus").execute()
  await db.schema.dropType("GroupReportReason").execute()
  await db.schema.dropTable("groupFollows").execute()
}
