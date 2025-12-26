import { writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parallel } from "radashi"

export const DB_RELATIVE_PATH = join("..", "..", "db", "src", "prisma")

export const CREATOR_ID = "db852a04-7406-4a6a-87f2-1b494e810a29"

export const migrationsPath = resolve(
  fileURLToPath(dirname(import.meta.url)),
  join(DB_RELATIVE_PATH, "migrations"),
)

export const seedsPath = resolve(
  fileURLToPath(dirname(import.meta.url)),
  join(DB_RELATIVE_PATH, "seeds"),
)

export const templatesPath = resolve(
  fileURLToPath(dirname(import.meta.url)),
  "templates",
)

export const outputDir = (scriptName: string) =>
  resolve(
    fileURLToPath(dirname(import.meta.url)),
    join("..", "..", "..", "output", scriptName),
  )

export const downloadFiles = (
  files: { id: string; url: string }[],
  basePath: string,
) => {
  return parallel({ limit: 3 }, files, async (file) => {
    const response = await fetch(file.url)
    const buffer = Buffer.from(await response.arrayBuffer())

    await writeFile(join(basePath, `${file.id}.jpg`), buffer)
  })
}
