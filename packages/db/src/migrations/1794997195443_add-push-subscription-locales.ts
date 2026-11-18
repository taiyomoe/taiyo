import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema.createType("Locale").asEnum(["en", "fr", "pt-BR"]).execute()

  // The interface language is a choice of each browser, not of the account, and a push lands on
  // one device: each subscription keeps the language of the device that saved it. Devices saved
  // before this migration get English until they next open the site and save it again.
  await db.schema
    .alterTable("pushSubscriptions")
    .addColumn("locale", sql`"Locale"`, (c) => c.notNull().defaultTo("en"))
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.alterTable("pushSubscriptions").dropColumn("locale").execute()
  await db.schema.dropType("Locale").execute()
}
