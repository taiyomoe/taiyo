import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

export const DB_RELATIVE_PATH = "../../../db/src/prisma"

export const CREATOR_ID = "db852a04-7406-4a6a-87f2-1b494e810a29"

export const migrationsPath = resolve(
  fileURLToPath(dirname(import.meta.url)),
  join(DB_RELATIVE_PATH, "migrations"),
)

export const seedsPath = resolve(
  fileURLToPath(dirname(import.meta.url)),
  join(DB_RELATIVE_PATH, "seeds"),
)
