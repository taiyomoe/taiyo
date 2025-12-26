import { readdir } from "node:fs/promises"
import { join } from "node:path"
import { PrismaClient, PrismaPg } from "@taiyomoe/db"
import { Command } from "commander"
import { seedsPath } from "../utils"

export const seedCommand = new Command("seed")
  .description("Seed the database")
  .option("--db <db>", "Database name", "taiyo")
  .action(async (options: { db: string }) => {
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL environment variable is not set")
      process.exit(1)
    }

    const url = new URL(process.env.DATABASE_URL)
    url.pathname = `/${options.db}`
    const adapter = new PrismaPg({ connectionString: url.toString() })
    const db = new PrismaClient({ adapter })

    console.log("Seeding database...")

    // Users
    console.log("\nUsers:")
    const users = await import(join(seedsPath, "users.ts"))
    await users.default.execute(db).then(() => console.log("Users seeded"))

    // Medias - dynamically load all media-*.ts files
    console.log("\nMedias:")
    const mediasDir = join(seedsPath, "medias")
    const mediaFiles = await readdir(mediasDir)
    const sortedMediaFiles = mediaFiles
      .filter((f) => f.startsWith("media-") && f.endsWith(".ts"))
      .sort((a, b) => {
        const numA = Number.parseInt(
          a.replace("media-", "").replace(".ts", ""),
          10,
        )
        const numB = Number.parseInt(
          b.replace("media-", "").replace(".ts", ""),
          10,
        )
        return numA - numB
      })

    for (const file of sortedMediaFiles) {
      const mediaModule = await import(join(mediasDir, file))
      const mediaNumber = file.replace("media-", "").replace(".ts", "")
      await mediaModule.default.execute(db)
      console.log(`Media ${mediaNumber} seeded`)
    }

    // Meilisearch
    console.log(
      "\nMeilisearch: Please run `infisical run -- pnpm -F meilisearch run seed`",
    )

    await db.$disconnect()
  })
