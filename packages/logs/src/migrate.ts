import { logsClient, rawLogsClient } from "./"
import migration1 from "./migrations/20240722143359_init"
import migration2 from "./migrations/20240723104911_add_chapters"
import migration3 from "./migrations/20240724160021_add_users_auth"
import migration4 from "./migrations/20240818012246_add_scans"
import migration5 from "./migrations/20240824232511_add_users_activity"

const migrations = [migration1, migration2, migration3, migration4, migration5]
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
