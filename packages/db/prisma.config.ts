import path from "node:path"
import { defineConfig } from "prisma/config"
import { env } from "./src/env"

export default defineConfig({
  datasource: { url: env.DATABASE_URL },
  schema: path.join("src", "prisma"),
  migrations: {
    path: path.join("src", "prisma", "migrations"),
    seed: path.join("src", "prisma", "seed.ts"),
  },
  typedSql: {
    path: path.join("src", "prisma", "sql"),
  },
})
