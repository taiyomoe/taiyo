import { Kysely, PostgresDialect } from "kysely"
import pg from "pg"
import type { DB } from "./database"
import { env } from "./env"

declare global {
  var kysely: Kysely<DB> | undefined
}

const dialect = new PostgresDialect({
  pool: new pg.Pool({ connectionString: env.DATABASE_URL }),
})

export const db = globalThis.kysely ?? new Kysely<DB>({ dialect })

if (process.env.NODE_ENV !== "production") {
  globalThis.kysely = db
}

export * from "kysely"

export * from "./constants"

export type { DB } from "./database"

export * from "./json-types"

export * from "./models/account-model"

export * from "./models/banner-model"

export * from "./models/chapter-group-model"

export * from "./models/chapter-model"

export * from "./models/cover-model"

export * from "./models/group-model"

export * from "./models/media-model"

export * from "./models/session-model"

export * from "./models/media-staff-model"

export * from "./models/staff-model"

export * from "./models/task-model"

export * from "./models/title-model"

export * from "./models/user-follow-model"

export * from "./models/user-history-model"

export * from "./models/user-library-model"

export * from "./models/user-profile-model"

export * from "./models/user-model"

export * from "./models/verification-model"

export * from "./types"
