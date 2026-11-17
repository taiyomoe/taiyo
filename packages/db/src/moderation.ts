import { sql } from "kysely"

/** Whether the `users` row in scope is banned right now. */
export const isBannedSql = sql<boolean>`coalesce("users"."banned", false) and ("users"."banExpires" is null or "users"."banExpires" > (CURRENT_TIMESTAMP at time zone 'UTC'))`
