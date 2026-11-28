import type { DB, Kysely } from "@taiyomoe/db"
import { config } from "@taiyomoe/config"

/** The content ratings of the user's settings, or the default setting when signed out. */
export const getUserContentRatings = async (db: Kysely<DB>, userId: string | null) => {
  const row =
    userId === null
      ? undefined
      : await db.selectFrom("users").select("settings").where("id", "=", userId).executeTakeFirst()
  const saved = row?.settings.contentRating

  // An empty setting would turn into an `in: []` filter, which the search skips.
  return saved && saved.length > 0 ? saved : [...config.settings.contentRating]
}
