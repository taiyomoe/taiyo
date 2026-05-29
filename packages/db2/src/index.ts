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

if (process.env.NODE_ENV !== "production") globalThis.kysely = db

export * from "kysely"
export * from "./constants"
export type { DB } from "./database"
export * from "./json-types"
export * from "./models/accounts-model"
export * from "./models/banners-model"
export * from "./models/chapter-to-groups-model"
export * from "./models/chapters-model"
export * from "./models/covers-model"
export * from "./models/groups-model"
export * from "./models/medias-model"
export * from "./models/sessions-model"
export * from "./models/staff-on-medias-model"
export * from "./models/staffs-model"
export * from "./models/tasks-model"
export * from "./models/titles-model"
export * from "./models/user-follows-model"
export * from "./models/user-histories-model"
export * from "./models/user-libraries-model"
export * from "./models/user-profiles-model"
export * from "./models/users-model"
export * from "./models/verifications-model"
export * from "./types"
