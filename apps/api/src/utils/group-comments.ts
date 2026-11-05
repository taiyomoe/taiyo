import { type DB, GROUP_MEMBERSHIP_ROLES, type Kysely } from "@taiyomoe/db"
import z from "zod"
import { userSummarySchema } from "./schemas"

export const groupCommentSchema = z.object({
  id: z.uuid(),
  content: z.string(),
  author: userSummarySchema.extend({
    groupRole: z.enum(GROUP_MEMBERSHIP_ROLES).nullable().meta({
      description: "The author's role in the group, or null when they aren't a member.",
    }),
  }),
  createdAt: z.iso.datetime(),
})

export const selectGroupComments = (db: Kysely<DB>, groupId: string) =>
  db
    .selectFrom("groupComments")
    .innerJoin("users", "users.id", "groupComments.userId")
    .leftJoin("groupMemberships", (join) =>
      join
        .onRef("groupMemberships.userId", "=", "groupComments.userId")
        .onRef("groupMemberships.groupId", "=", "groupComments.groupId"),
    )
    .where("groupComments.groupId", "=", groupId)
    .where("groupComments.deletedAt", "is", null)
    .select([
      "groupComments.id",
      "groupComments.content",
      "groupComments.createdAt",
      "users.id as userId",
      "users.username",
      "users.displayUsername",
      "users.image",
      "groupMemberships.role as groupRole",
    ])

type GroupCommentRow = Awaited<
  ReturnType<ReturnType<typeof selectGroupComments>["executeTakeFirstOrThrow"]>
>

export const toGroupComment = (row: GroupCommentRow) => ({
  id: row.id,
  content: row.content,
  author: {
    id: row.userId,
    username: row.username,
    displayUsername: row.displayUsername,
    image: row.image,
    groupRole: row.groupRole,
  },
  createdAt: row.createdAt,
})
