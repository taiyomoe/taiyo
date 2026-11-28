import type { DB, Kysely } from "@taiyomoe/db"
import { config } from "@taiyomoe/config"

/** Whether the session signed in within the last day. The session may come from the cache: the row is authoritative. */
export const isSessionFresh = async (db: Kysely<DB>, sessionId: string) => {
  const session = await db
    .selectFrom("sessions")
    .select("createdAt")
    .where("id", "=", sessionId)
    .executeTakeFirst()

  return (
    session !== undefined &&
    Date.now() - session.createdAt.getTime() < config.auth.sessionFreshAgeSeconds * 1000
  )
}
