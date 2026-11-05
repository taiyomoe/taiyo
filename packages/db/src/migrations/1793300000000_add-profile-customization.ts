import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<unknown>) {
  await db.schema.alterTable("users").addColumn("nameEffect", "text").execute()
  await db.schema.alterTable("userProfiles").addColumn("title", "text").execute()

  await db.schema.createType("UserCosmeticKind").asEnum(["NAME_EFFECT", "TITLE"]).execute()

  await db.schema
    .createTable("userCosmetics")
    .addColumn("userId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("kind", sql`"UserCosmeticKind"`, (c) => c.notNull())
    .addColumn("key", "text", (c) => c.notNull())
    .addColumn("acquiredAt", sql`timestamp(3)`, (c) =>
      c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .addPrimaryKeyConstraint("userCosmetics_pkey", ["userId", "kind", "key"])
    .execute()

  await db.schema
    .createTable("userProfileComments")
    .addColumn("id", "uuid", (c) => c.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profileId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("authorId", "uuid", (c) =>
      c.notNull().references("users.id").onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("content", "text", (c) => c.notNull())
    .addColumn("createdAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updatedAt", sql`timestamp(3)`, (c) => c.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("deletedAt", sql`timestamp(3)`)
    .addCheckConstraint(
      "userProfileComments_content_check",
      sql`char_length("content") BETWEEN 1 AND 1000`,
    )
    .execute()

  await sql`
    CREATE INDEX "userProfileComments_profileId_createdAt_idx"
      ON "userProfileComments" ("profileId", "createdAt" DESC)
      WHERE "deletedAt" IS NULL
  `.execute(db)

  await sql`
    CREATE TRIGGER "userProfileComments_set_updated_at"
    BEFORE UPDATE ON "userProfileComments"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at()
  `.execute(db)

  await sql`
    CREATE INDEX "chapters_uploaderId_createdAt_idx"
      ON "chapters" ("uploaderId", "createdAt" DESC)
      WHERE "deletedAt" IS NULL
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await sql`DROP INDEX IF EXISTS "chapters_uploaderId_createdAt_idx"`.execute(db)
  await db.schema.dropTable("userProfileComments").execute()
  await db.schema.dropTable("userCosmetics").execute()
  await db.schema.dropType("UserCosmeticKind").execute()
  await db.schema.alterTable("userProfiles").dropColumn("title").execute()
  await db.schema.alterTable("users").dropColumn("nameEffect").execute()
}
