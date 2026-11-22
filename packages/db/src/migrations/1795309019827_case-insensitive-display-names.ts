import { type Kysely, sql } from "kysely"

// config.auth.displayName.maxLength when this migration was written.
const MAX_LENGTH = 30
const withSuffix = (base: string, suffix: string) =>
  `${base.slice(0, MAX_LENGTH - suffix.length)}${suffix}`

/**
 * Display names are unique ignoring case. The index used to be case-sensitive, so names that
 * differ only by case may exist: the oldest account keeps its name, the others get a suffix.
 */
export async function up(db: Kysely<unknown>): Promise<void> {
  const { rows } = await sql<{ id: string; displayUsername: string }>`
    SELECT "id", "displayUsername" FROM (
      SELECT "id", "displayUsername", "createdAt", row_number() OVER (
        PARTITION BY lower("displayUsername") ORDER BY "createdAt", "id"
      ) AS "rank"
      FROM "users"
    ) AS "ranked"
    WHERE "rank" > 1
    ORDER BY "createdAt", "id"
  `.execute(db)

  for (const row of rows) {
    for (let suffix = 2; ; suffix++) {
      const candidate = withSuffix(row.displayUsername, `_${suffix}`)
      const { rows: taken } = await sql`
        SELECT 1 FROM "users" WHERE lower("displayUsername") = lower(${candidate})
      `.execute(db)

      if (taken.length === 0) {
        await sql`
          UPDATE "users" SET "displayUsername" = ${candidate}, "name" = ${candidate}
          WHERE "id" = ${row.id}
        `.execute(db)

        break
      }
    }
  }

  await sql`DROP INDEX "users_displayUsername_key"`.execute(db)
  await sql`
    CREATE UNIQUE INDEX "users_displayUsername_lower_key" ON "users" (lower("displayUsername"))
  `.execute(db)
}

// The renamed display names are not restored: that data change is irreversible.
export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`DROP INDEX "users_displayUsername_lower_key"`.execute(db)
  await sql`
    CREATE UNIQUE INDEX "users_displayUsername_key" ON "users" ("displayUsername")
  `.execute(db)
}
