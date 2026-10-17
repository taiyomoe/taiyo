import { type Kysely, sql } from "kysely"

const TABLES = ["userHistories", "userLibraryEntries", "chapters", "covers", "medias", "users"]
const INDEXES = TABLES.map((table) => ({ table, name: `${table}_createdAt_idx` }))

export async function up(db: Kysely<unknown>): Promise<void> {
  // CONCURRENTLY can't run inside the migrator's transaction, so step out of it
  // and reopen one for the migrator to commit.
  await sql`COMMIT`.execute(db)

  const invalid = await sql<{ name: string }>`
    SELECT c.relname AS name
    FROM pg_index i
    JOIN pg_class c ON c.oid = i.indexrelid
    WHERE NOT i.indisvalid AND c.relname = ANY(${INDEXES.map((i) => i.name)})
  `.execute(db)

  for (const { name } of invalid.rows) {
    await sql`DROP INDEX CONCURRENTLY ${sql.id(name)}`.execute(db)
  }

  for (const { table, name } of INDEXES) {
    await sql`CREATE INDEX CONCURRENTLY IF NOT EXISTS ${sql.id(name)} ON ${sql.id(table)} ("createdAt")`.execute(
      db,
    )
  }

  await sql`BEGIN`.execute(db)
}

export async function down(db: Kysely<unknown>): Promise<void> {
  for (const { name } of INDEXES) {
    await db.schema.dropIndex(name).execute()
  }
}
