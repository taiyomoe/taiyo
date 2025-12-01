import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { PrismaClient, PrismaPg } from "@taiyomoe/db"
import { Command } from "commander"
import { DB_RELATIVE_PATH } from "../utils"

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

    const seedsPath = resolve(
      fileURLToPath(dirname(import.meta.url)),
      join(DB_RELATIVE_PATH, "seeds"),
    )

    const group1 = await import(join(seedsPath, "groups/group-1.ts"))
    const group2 = await import(join(seedsPath, "groups/group-2.ts"))
    const group3 = await import(join(seedsPath, "groups/group-3.ts"))
    const group4 = await import(join(seedsPath, "groups/group-4.ts"))
    const group5 = await import(join(seedsPath, "groups/group-5.ts"))
    const group6 = await import(join(seedsPath, "groups/group-6.ts"))
    const group7 = await import(join(seedsPath, "groups/group-7.ts"))
    const group8 = await import(join(seedsPath, "groups/group-8.ts"))
    const group9 = await import(join(seedsPath, "groups/group-9.ts"))
    const group10 = await import(join(seedsPath, "groups/group-10.ts"))
    const group11 = await import(join(seedsPath, "groups/group-11.ts"))
    const media1 = await import(join(seedsPath, "medias/media-1.ts"))
    const media2 = await import(join(seedsPath, "medias/media-2.ts"))
    const media3 = await import(join(seedsPath, "medias/media-3.ts"))
    const media4 = await import(join(seedsPath, "medias/media-4.ts"))
    const media5 = await import(join(seedsPath, "medias/media-5.ts"))
    const media6 = await import(join(seedsPath, "medias/media-6.ts"))
    const media7 = await import(join(seedsPath, "medias/media-7.ts"))
    const media8 = await import(join(seedsPath, "medias/media-8.ts"))
    const media9 = await import(join(seedsPath, "medias/media-9.ts"))
    const media10 = await import(join(seedsPath, "medias/media-10.ts"))
    const users = await import(join(seedsPath, "users.ts"))

    console.log("Seeding database...")

    // Users
    console.log("\nUsers:")
    await users.default.execute(db).then(() => console.log("Users seeded"))

    // Medias
    console.log("\nMedias:")
    await media1.default.execute(db).then(() => console.log("Media 1 seeded"))
    await media2.default.execute(db).then(() => console.log("Media 2 seeded"))
    await media3.default.execute(db).then(() => console.log("Media 3 seeded"))
    await media4.default.execute(db).then(() => console.log("Media 4 seeded"))
    await media5.default.execute(db).then(() => console.log("Media 5 seeded"))
    await media6.default.execute(db).then(() => console.log("Media 6 seeded"))
    await media7.default.execute(db).then(() => console.log("Media 7 seeded"))
    await media8.default.execute(db).then(() => console.log("Media 8 seeded"))
    await media9.default.execute(db).then(() => console.log("Media 9 seeded"))
    await media10.default.execute(db).then(() => console.log("Media 10 seeded"))

    // Groups
    console.log("\nGroups:")
    await group1.default.execute(db).then(() => console.log("Group 1 seeded"))
    await group2.default.execute(db).then(() => console.log("Group 2 seeded"))
    await group3.default.execute(db).then(() => console.log("Group 3 seeded"))
    await group4.default.execute(db).then(() => console.log("Group 4 seeded"))
    await group5.default.execute(db).then(() => console.log("Group 5 seeded"))
    await group6.default.execute(db).then(() => console.log("Group 6 seeded"))
    await group7.default.execute(db).then(() => console.log("Group 7 seeded"))
    await group8.default.execute(db).then(() => console.log("Group 8 seeded"))
    await group9.default.execute(db).then(() => console.log("Group 9 seeded"))
    await group10.default.execute(db).then(() => console.log("Group 10 seeded"))
    await group11.default.execute(db).then(() => console.log("Group 11 seeded"))

    // Meilisearch
    console.log(
      "\nMeilisearch: Please run `infisical run -- pnpm -F meilisearch run seed`",
    )

    await db.$disconnect()
  })
