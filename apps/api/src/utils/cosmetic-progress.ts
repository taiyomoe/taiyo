import type { CosmeticProgress } from "@taiyomoe/db/cosmetics"
import { type DB, type Kysely, sql } from "@taiyomoe/db"
import { isBannedSql } from "./user-moderation"

/** The counters achievement cosmetics unlock against, in one round trip. */
export const getCosmeticProgress = async (db: Kysely<DB>, userId: string) => {
  const row = await db
    .selectNoFrom((eb) => [
      eb
        .selectFrom("userHistories")
        .where("userHistories.userId", "=", userId)
        .where("userHistories.completed", "=", true)
        .select(eb.fn.countAll<string>().as("count"))
        .as("chaptersRead"),
      eb
        .selectFrom("chapters")
        .where("chapters.uploaderId", "=", userId)
        .where("chapters.deletedAt", "is", null)
        .where("chapters.status", "=", "PUBLISHED")
        .select(eb.fn.countAll<string>().as("count"))
        .as("chaptersUploaded"),
      eb
        .selectFrom("userFollows")
        .innerJoin("users", "users.id", "userFollows.followerId")
        .where("userFollows.followingId", "=", userId)
        .where(sql<boolean>`not (${isBannedSql})`)
        .select(eb.fn.countAll<string>().as("count"))
        .as("followers"),
      eb
        .selectFrom("userProfileComments")
        .where("userProfileComments.authorId", "=", userId)
        .where("userProfileComments.deletedAt", "is", null)
        .select(eb.fn.countAll<string>().as("count"))
        .as("commentsWritten"),
    ])
    .executeTakeFirstOrThrow()

  return {
    chaptersRead: Number(row.chaptersRead ?? 0),
    chaptersUploaded: Number(row.chaptersUploaded ?? 0),
    followers: Number(row.followers ?? 0),
    commentsWritten: Number(row.commentsWritten ?? 0),
  } satisfies CosmeticProgress
}
