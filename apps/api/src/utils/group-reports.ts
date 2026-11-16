import type { DB, Kysely } from "@taiyomoe/db"
import z from "zod"

export const groupReportOutcomeSchema = z.enum(["RESOLVED", "DISMISSED"]).meta({
  description:
    "The outcome of the review: `RESOLVED` when action was taken on the group, `DISMISSED` when nothing was wrong.",
  example: "RESOLVED",
})

export const groupReportNoteSchema = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((value) => (value === undefined || value === "" ? null : value))
  .meta({
    description: "An internal note about the decision, up to 2000 characters.",
    example: "Confirmed with the original group.",
  })

/** Closes a pending report as resolved or dismissed, with an optional internal note. */
export const reviewGroupReport = async (
  db: Kysely<DB>,
  {
    reportId,
    reviewerId,
    status,
    note,
  }: {
    reportId: string
    reviewerId: string
    status: z.infer<typeof groupReportOutcomeSchema>
    note: string | null
  },
) => {
  const report = await db
    .selectFrom("groupReports")
    .select("groupId")
    .where("id", "=", reportId)
    .executeTakeFirst()

  if (report === undefined) {
    return { ok: false, error: "GROUP_REPORT_NOT_FOUND", groupId: null } as const
  }

  const reviewed = await db
    .updateTable("groupReports")
    .set({ status, reviewerId, reviewerNote: note })
    .where("id", "=", reportId)
    .where("status", "=", "PENDING")
    .returning("id")
    .executeTakeFirst()

  return reviewed === undefined
    ? ({ ok: false, error: "GROUP_REPORT_NOT_PENDING", groupId: report.groupId } as const)
    : ({ ok: true, groupId: report.groupId } as const)
}
