import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<unknown>) {
  await db.schema
    .alterTable("users")
    .addColumn("twoFactorEnabled", "boolean", (c) => c.notNull().defaultTo(false))
    .execute()

  await db.schema
    .createTable("twoFactors")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("secret", "text", (c) => c.notNull())
    .addColumn("backupCodes", "text", (c) => c.notNull())
    .addColumn("verified", "boolean", (c) => c.notNull().defaultTo(true))
    .addColumn("failedVerificationCount", "integer", (c) => c.notNull().defaultTo(0))
    .addColumn("lockedUntil", sql`timestamp(3)`)
    .execute()

  await db.schema.createIndex("twoFactors_userId_idx").on("twoFactors").column("userId").execute()
  await db.schema.createIndex("twoFactors_secret_idx").on("twoFactors").column("secret").execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable("twoFactors").execute()
  await db.schema.alterTable("users").dropColumn("twoFactorEnabled").execute()
}
