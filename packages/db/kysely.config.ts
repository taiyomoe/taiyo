import { defineConfig } from "kysely-ctl"
import { env } from "./src/env"
import { createPool } from "./src/pool"

export default defineConfig({
  dialect: "pg",
  dialectConfig: {
    pool: createPool(env.DATABASE_URL),
  },
  migrations: {
    migrationFolder: "src/migrations",
  },
  seeds: {
    seedFolder: "src/seeds",
  },
  $test: {
    seeds: {
      seedFolder: "src/fixtures",
    },
  },
})
