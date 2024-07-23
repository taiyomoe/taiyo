import { client } from "./"
import migration1 from "./migrations/20240722143359_init"
import { wrapper } from "./wrapper"

const migrations = [migration1]
const migrationsRan = await wrapper.migrations.getAll()
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

  await wrapper.migrations.insert(migration.name, finishedAt, startedAt)

  console.log(
    `Migration ${migration.name} finished. Took ${finishedAt.getTime() - startedAt.getTime()}ms`,
  )
}

await client.close()
