import { type Kysely, sql } from "kysely"

const TABLES = [
  "users",
  "userProfiles",
  "accounts",
  "sessions",
  "verifications",
  "groups",
  "staffs",
  "medias",
  "banners",
  "covers",
  "titles",
  "chapters",
  "tasks",
] as const

// biome-ignore lint/suspicious/noExplicitAny: migrations are frozen in time
export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW."updatedAt" = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `.execute(db)

  for (const table of TABLES) {
    await db.schema
      .alterTable(table)
      .alterColumn("updatedAt", (c) => c.setDefault(sql`CURRENT_TIMESTAMP`))
      .execute()

    await sql`
      CREATE TRIGGER ${sql.raw(`"${table}_set_updated_at"`)}
      BEFORE UPDATE ON ${sql.id(table)}
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at()
    `.execute(db)
  }
}

// biome-ignore lint/suspicious/noExplicitAny: migrations are frozen in time
export async function down(db: Kysely<any>): Promise<void> {
  for (const table of [...TABLES].reverse()) {
    await sql`DROP TRIGGER IF EXISTS ${sql.raw(`"${table}_set_updated_at"`)} ON ${sql.id(table)}`.execute(
      db,
    )

    await db.schema
      .alterTable(table)
      .alterColumn("updatedAt", (c) => c.dropDefault())
      .execute()
  }

  await sql`DROP FUNCTION IF EXISTS set_updated_at()`.execute(db)
}
