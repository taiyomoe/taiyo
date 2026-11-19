import { Kysely, PostgresDialect } from "kysely"
import pg from "pg"
import type { DB } from "./database"
import { env } from "./env"

// Timestamps are stored as UTC without a zone: read and write them as UTC whatever the process zone.
pg.defaults.parseInputDatesAsUTC = true
pg.types.setTypeParser(
  pg.types.builtins.TIMESTAMP,
  (value) => new Date(`${value.replace(" ", "T")}Z`),
)

export const getDb = (connectionString = env.DATABASE_URL) =>
  new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({ connectionString }),
    }),
  })

export * from "kysely"

export * from "./achievements"

export * from "./constants"

export * from "./cosmetics"

export type { DB }

export * from "./json-types"

export * from "./moderation"

export * from "./models/account-model"

export * from "./models/audit-log-model"

export * from "./models/banner-model"

export * from "./models/chapter-group-model"

export * from "./models/chapter-model"

export * from "./models/blocked-comment-image-model"

export * from "./models/comment-image-favorite-model"

export * from "./models/comment-image-model"

export * from "./models/comment-image-usage-model"

export * from "./models/comment-model"

export * from "./models/comment-report-model"

export * from "./models/comment-revision-model"

export * from "./models/comment-thread-model"

export * from "./models/comment-vote-model"

export * from "./models/cover-model"

export * from "./models/featured-media-model"

export * from "./models/group-creation-request-model"

export * from "./models/group-invitation-model"

export * from "./models/group-follow-model"

export * from "./models/group-membership-model"

export * from "./models/group-model"

export * from "./models/group-ownership-request-model"

export * from "./models/group-report-model"

export * from "./models/mangadex-sync-item-model"

export * from "./models/mangadex-sync-model"

export * from "./models/media-model"

export * from "./models/search-outbox-model"

export * from "./models/notification-actor-model"

export * from "./models/notification-model"

export * from "./models/notification-outbox-model"

export * from "./models/push-subscription-model"

export * from "./models/ranking-period-model"

export * from "./models/ranking-result-model"

export * from "./models/session-model"

export * from "./models/media-staff-model"

export * from "./models/media-suggestion-model"

export * from "./models/page-bookmark-model"

export * from "./models/page-report-model"

export * from "./models/reader-total-model"

export * from "./models/reading-reward-model"

export * from "./models/shop-purchase-model"

export * from "./models/staff-model"

export * from "./models/task-model"

export * from "./models/title-model"

export * from "./models/two-factor-model"

export * from "./models/user-achievement-model"

export * from "./models/user-cosmetic-model"

export * from "./models/user-follow-model"

export * from "./models/user-history-model"

export * from "./models/user-library-entry-model"

export * from "./models/user-list-item-model"

export * from "./models/user-list-model"

export * from "./models/user-list-vote-model"

export * from "./models/user-profile-model"

export * from "./models/user-report-model"

export * from "./models/user-model"

export * from "./models/verification-model"

export * from "./rankings"

export type { Json } from "./types"
