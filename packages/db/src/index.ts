import { Kysely, PostgresDialect } from "kysely"
import pg from "pg"
import type { DB } from "./database"
import { env } from "./env"

export const getDb = (connectionString = env.DATABASE_URL) =>
  new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({ connectionString }),
    }),
  })

export * from "kysely"

export * from "./constants"

export type { DB } from "./database"

export * from "./json-types"

export * from "./models/account-model"

export * from "./models/banner-model"

export * from "./models/chapter-group-model"

export * from "./models/chapter-model"

export * from "./models/cover-model"

export * from "./models/group-membership-model"

export * from "./models/group-model"

export * from "./models/group-ownership-request-model"

export * from "./models/media-model"

export * from "./models/session-model"

export * from "./models/media-staff-model"

export * from "./models/staff-model"

export * from "./models/task-model"

export * from "./models/title-model"

export * from "./models/user-follow-model"

export * from "./models/user-history-model"

export * from "./models/user-library-entry-model"

export * from "./models/user-list-item-model"

export * from "./models/user-list-model"

export * from "./models/user-profile-model"

export * from "./models/user-model"

export * from "./models/verification-model"

export * from "./types"
