import { type Kysely, sql } from "kysely"

const TABLES = ["covers", "banners"] as const

export async function up(db: Kysely<any>): Promise<void> {
  for (const table of TABLES) {
    await db.schema
      .alterTable(table)
      .addColumn("extension", "text", (c) => c.notNull().defaultTo("jpg"))
      .execute()

    await db.schema
      .alterTable(table)
      .addCheckConstraint(`${table}_extension_check`, sql`"extension" IN ('jpg', 'gif')`)
      .execute()
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  for (const table of TABLES) {
    await db.schema.alterTable(table).dropConstraint(`${table}_extension_check`).execute()
    await db.schema.alterTable(table).dropColumn("extension").execute()
  }
}
