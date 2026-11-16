import { COMMENT_REPORT_REASONS, type DB, type Kysely, sql } from "@taiyomoe/db"
import z from "zod"
import { userSummarySchema } from "./schemas"

export const commentReportSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the report." }),
  reason: z
    .enum(COMMENT_REPORT_REASONS)
    .meta({ description: "Why the comment was reported.", example: "SPAM" }),
  details: z.string().nullable().meta({
    description: "What the reporter told the moderators, if anything.",
    example: "Reveals the ending of the series without a spoiler tag.",
  }),
  createdAt: z.iso.datetime().meta({ description: "When the report was made." }),
  reporter: userSummarySchema
    .pick({ id: true, username: true, displayUsername: true, nameEffect: true })
    .meta({ description: "The user who made the report." }),
})

export const selectCommentReports = (db: Kysely<DB>) =>
  db
    .selectFrom("commentReports as r")
    .innerJoin("users as ru", "ru.id", "r.reporterId")
    .select([
      "r.id",
      "r.commentId",
      "r.reason",
      "r.details",
      sql<string>`to_char("r"."createdAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`.as("createdAt"),
      "ru.id as reporterId",
      "ru.username",
      "ru.displayUsername",
      "ru.nameEffect",
    ])

type CommentReportRow = Awaited<
  ReturnType<ReturnType<typeof selectCommentReports>["executeTakeFirstOrThrow"]>
>

export const toCommentReport = (row: CommentReportRow) =>
  ({
    id: row.id,
    reason: row.reason,
    details: row.details,
    createdAt: row.createdAt,
    reporter: {
      id: row.reporterId,
      username: row.username,
      displayUsername: row.displayUsername,
      nameEffect: row.nameEffect,
    },
  }) satisfies z.infer<typeof commentReportSchema>

/** Closes every open report on the comments. */
export const closeCommentReports = async (
  db: Kysely<DB>,
  commentIds: readonly string[],
  { status, resolverId }: { status: "RESOLVED" | "DISMISSED"; resolverId: string },
) => {
  if (commentIds.length === 0) {
    return 0
  }

  const result = await db
    .updateTable("commentReports")
    .set({ status, resolverId, resolvedAt: sql<Date>`CURRENT_TIMESTAMP` })
    .where("commentId", "in", commentIds)
    .where("status", "=", "OPEN")
    .executeTakeFirst()

  return Number(result.numUpdatedRows)
}

export const closeStatusSchema = z.enum(["RESOLVED", "DISMISSED"]).meta({
  description:
    "How to close the reports: `RESOLVED` once you acted on them, `DISMISSED` when the comment is fine.",
  example: "DISMISSED",
})
