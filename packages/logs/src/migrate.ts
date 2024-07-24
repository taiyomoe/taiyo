import { logsClient, rawLogsClient } from "./"
import migration1 from "./migrations/20240722143359_init"
import migration2 from "./migrations/20240723104911_add_chapters"

const migrations = [migration1, migration2]
const migrationsRan = await logsClient.migrations.getAll()
const migrationsToRun = migrations.filter((m) =>
  migrationsRan.every((mr) => mr.migrationName !== m.name),
)

if (migrationsToRun.length === 0) {
  console.log("No migrations to run.")
  process.exit()
}

for (const migration of migrationsToRun) {
  const startedAt = new Date()

  console.log(`Running migration ${migration.name}...`)

  await migration.up()

  const finishedAt = new Date()

  await logsClient.migrations.insert(migration.name, finishedAt, startedAt)

  console.log(
    `Migration ${migration.name} finished. Took ${finishedAt.getTime() - startedAt.getTime()}ms`,
  )
}

await rawLogsClient.close()
