import type { DB, Kysely } from "@taiyomoe/db"
import type { ReportOutcome } from "./schemas"

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
    status: ReportOutcome
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
