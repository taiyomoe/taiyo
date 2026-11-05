import { type DB, type Kysely, sql } from "@taiyomoe/db"
import z from "zod"
import { userSummarySchema } from "./schemas"
import { isBannedSql } from "./user-moderation"

export const profileCommentSchema = z.object({
  id: z.uuid(),
  content: z.string(),
  createdAt: z.iso.datetime(),
  author: userSummarySchema.extend({
    title: z.string().nullable().meta({ description: "The author's equipped profile title." }),
  }),
  canDelete: z
    .boolean()
    .meta({ description: "Whether you may delete it: its author, the profile owner, or staff." }),
})

export const selectProfileComments = (db: Kysely<DB>) =>
  db
    .selectFrom("userProfileComments")
    .innerJoin("users", "users.id", "userProfileComments.authorId")
    .leftJoin("userProfiles", "userProfiles.userId", "users.id")
    .where("userProfileComments.deletedAt", "is", null)
    .where(sql<boolean>`not (${isBannedSql})`)
    .select([
      "userProfileComments.id",
      "userProfileComments.content",
      "userProfileComments.profileId",
      sql<string>`to_char("userProfileComments"."createdAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as(
        "createdAt",
      ),
      "users.id as authorId",
      "users.username as authorUsername",
      "users.displayUsername as authorDisplayUsername",
      "users.image as authorImage",
      "users.nameEffect as authorNameEffect",
      "userProfiles.title as authorTitle",
    ])

type CommentRow = Awaited<
  ReturnType<ReturnType<typeof selectProfileComments>["executeTakeFirstOrThrow"]>
>

export const toProfileComment = (
  row: CommentRow,
  viewer: { id: string; canModerate: boolean } | null,
) => ({
  id: row.id,
  content: row.content,
  createdAt: row.createdAt,
  author: {
    id: row.authorId,
    username: row.authorUsername,
    displayUsername: row.authorDisplayUsername,
    image: row.authorImage,
    nameEffect: row.authorNameEffect,
    title: row.authorTitle,
  },
  canDelete:
    viewer !== null &&
    (viewer.canModerate || viewer.id === row.authorId || viewer.id === row.profileId),
})
