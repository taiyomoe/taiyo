import { type Kysely, sql } from "kysely"

const INDEXES = [
  {
    name: "chapters_pending_createdAt_idx",
    definition: sql`ON "chapters" ("createdAt") WHERE "status" = 'PENDING' AND "deletedAt" IS NULL`,
  },
  {
    name: "chapters_uploaderId_status_idx",
    definition: sql`ON "chapters" ("uploaderId", "status")`,
  },
]

export async function up(db: Kysely<unknown>) {
  await db.schema.createType("ChapterStatus").asEnum(["PENDING", "PUBLISHED", "REJECTED"]).execute()

  await db.schema
    .alterTable("chapters")
    .addColumn("status", sql`"ChapterStatus"`, (c) => c.notNull().defaultTo("PUBLISHED"))
    .addColumn("reviewerId", "uuid", (c) =>
      c.references("users.id").onDelete("set null").onUpdate("cascade"),
    )
    .addColumn("reviewedAt", sql`timestamp(3)`)
    .addColumn("rejectionReason", "text")
    .execute()

  await sql`COMMIT`.execute(db)

  for (const { name, definition } of INDEXES) {
    await sql`DROP INDEX CONCURRENTLY IF EXISTS ${sql.id(name)}`.execute(db)
    await sql`CREATE INDEX CONCURRENTLY ${sql.id(name)} ${definition}`.execute(db)
  }

  await sql`BEGIN`.execute(db)
}

export async function down(db: Kysely<unknown>) {
  for (const { name } of INDEXES) {
    await db.schema.dropIndex(name).ifExists().execute()
  }

  await db.schema
    .alterTable("chapters")
    .dropColumn("status")
    .dropColumn("reviewerId")
    .dropColumn("reviewedAt")
    .dropColumn("rejectionReason")
    .execute()
  await db.schema.dropType("ChapterStatus").execute()
}
