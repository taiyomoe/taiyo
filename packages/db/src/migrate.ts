import { FileMigrationProvider, Migrator } from "kysely/migration"
import { promises as fs } from "node:fs"
import path from "node:path"
import { getDb } from "./index"

// Production entry point for the pre-deploy migration Job: kysely-ctl is a dev dependency
// and is absent from the runtime image. Migration keys match kysely-ctl's (file name
// without extension), so both share the same `kysely_migration` history.
const db = getDb()
const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(import.meta.dirname, "migrations"),
  }),
})
const { error, results = [] } = await migrator.migrateToLatest()

for (const result of results) {
  process.stdout.write(`${result.status}: ${result.migrationName}\n`)
}

await db.destroy()

if (error !== undefined) {
  process.stderr.write(
    `migration failed: ${error instanceof Error ? (error.stack ?? error.message) : JSON.stringify(error)}\n`,
  )
  process.exit(1)
}
