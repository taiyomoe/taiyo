import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { Command } from "commander"
import { migrationsPath } from "../utils"

const generateTimestamp = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  const seconds = String(now.getSeconds()).padStart(2, "0")

  return `${year}${month}${day}${hours}${minutes}${seconds}`
}

const DATA_MIGRATION_TEMPLATE = `import type { Prisma } from "@taiyomoe/db"

export default async (tx: Prisma.TransactionClient) => {
}
`

export const createMigrationCommand = new Command("create-migration")
  .description(
    "Create a new migration folder with SQL and data migration files",
  )
  .requiredOption("--name <name>", "Migration name")
  .action(async (options: { name: string }) => {
    const timestamp = generateTimestamp()
    const folderName = `${timestamp}_${options.name}`

    const migrationFolderPath = join(migrationsPath, folderName)

    await mkdir(migrationFolderPath, { recursive: true })

    await writeFile(join(migrationFolderPath, "migration.sql"), "")
    await writeFile(
      join(migrationFolderPath, "data-migration.ts"),
      DATA_MIGRATION_TEMPLATE,
    )

    console.log(`Created migration: ${folderName}`)
    console.log(`  - ${migrationFolderPath}/migration.sql`)
    console.log(`  - ${migrationFolderPath}/data-migration.ts`)
  })
