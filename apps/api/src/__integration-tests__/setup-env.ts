import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"

const envPath = fileURLToPath(new URL("../../.env", import.meta.url))

if (!process.env.CI) {
  if (!existsSync(envPath)) {
    throw new Error(
      `Integration tests need apps/api/.env, which does not exist.\n` +
        `Run: cp apps/api/.env.example apps/api/.env\n` +
        `See the "Getting started" section of README.md.`,
    )
  }

  process.loadEnvFile(envPath)
}

process.env.TEST = "1"
