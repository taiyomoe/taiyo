import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<any>): Promise<void> {
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
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("covers").dropConstraint("covers_extension_check").execute()
  await db.schema.alterTable("covers").dropColumn("extension").execute()

  await db.schema.alterTable("banners").dropConstraint("banners_extension_check").execute()
  await db.schema.alterTable("banners").dropColumn("extension").execute()
}
