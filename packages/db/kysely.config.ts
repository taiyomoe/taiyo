import { defineConfig } from "kysely-ctl"
import pg from "pg"
import { env } from "./src/env"

export default defineConfig({
  dialect: "pg",
  dialectConfig: {
    pool: new pg.Pool({ connectionString: env.DATABASE_URL }),
  },
  migrations: {
    migrationFolder: "src/migrations",
  },
  seeds: {
    seedFolder: "src/seeds",
  },
})
