import { createHash, randomUUID } from "crypto"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { PrismaClient } from "@prisma/client"
import { readFile, readdir } from "fs/promises"

const MIGRATIONS_RELATIVE_PATH = "./prisma/migrations"

type Migration = {
  id: string
  checksum: string
  finished_at: Date
  migration_name: string
  logs: string
  rolled_back_at: Date
  started_at: Date
  applied_steps_count: number
}

const prisma = new PrismaClient()

const main = async () => {
  console.log("Starting migrations handler...")
  console.log(
    "Beware this migrations handler doesn't have any fancy features as the one PrismaORM does. It will not detect schema drifts or modified-after-applied migrations.",
  )
  console.log("Please use it at your own risk.\n")

  const migrationsPath = join(
    fileURLToPath(dirname(import.meta.url)),
    MIGRATIONS_RELATIVE_PATH,
  )
  const rawFoundMigrations = await readdir(
    join(fileURLToPath(dirname(import.meta.url)), MIGRATIONS_RELATIVE_PATH),
  )
  const foundMigrations = rawFoundMigrations.filter(
    (m) => !["migration_lock.toml", ".DS_Store"].includes(m),
  )
  const appliedMigrations = await prisma.$queryRaw<
    Migration[]
  >`SELECT * FROM _prisma_migrations`.catch(() => null)

  if (!appliedMigrations) {
    console.log(
      "Your database doesn't seem to be initialized. Please initialize it first.",
    )
    process.exit(1)
  }

  const migrationsToApply = foundMigrations.filter(
    (m) => !appliedMigrations.find((am) => am.migration_name === m),
  )

  if (appliedMigrations.length > foundMigrations.length) {
    console.log(
      "You have more applied migrations than found migrations. This is not possible.",
    )
    console.log(
      "You probably did something wrong. Please check your migrations and try again.",
    )
    process.exit(1)
  }

  if (migrationsToApply.length === 0) {
    console.log("No migrations to apply.")
    process.exit(0)
  }

  await prisma.$transaction(
    async (tx) => {
      for (const migrationName of migrationsToApply) {
        const migrationPath = join(migrationsPath, migrationName)
        const files = await readdir(migrationPath)
        const sqlFile = files.find((f) => f.endsWith(".sql"))
        const dataMigrationFile = files.find((f) => f.endsWith(".ts"))

        if (!sqlFile) {
          console.log(
            `Migration ${migrationName} has no SQL file. This should not happen.`,
          )
          process.exit(1)
        }

        console.log(
          `Executing migration ${migrationName}... ${dataMigrationFile ? "A data migration was also found and will be executed right after." : ""}`,
        )

        const sqlContent = await readFile(join(migrationPath, sqlFile), "utf8")
        const statements = sqlContent.split(";")

        for (const statement of statements) {
          try {
            await tx.$executeRawUnsafe(statement)
          } catch (err) {
            console.log(
              `There was an error while executing the migration ${migrationName}.`,
            )
            console.error(err)
            process.exit(1)
          }
        }

        const id = randomUUID()
        const checksum = createHash("sha256").update(sqlContent).digest("hex")

        await tx.$executeRaw`INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name) VALUES (${id}, ${checksum}, NOW(), ${migrationName})`

        console.log(`Migration ${migrationName} executed successfully.`)

        if (dataMigrationFile) {
          const dataMigrationPath = join(migrationPath, dataMigrationFile)
          const dataMigration = await import(dataMigrationPath)

          await dataMigration.default(tx)

          console.log(
            `Data migration ${dataMigrationFile} executed successfully.`,
          )
        }
      }
    },
    { timeout: 1000000000 },
  )
}

main()
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => await prisma.$disconnect())
