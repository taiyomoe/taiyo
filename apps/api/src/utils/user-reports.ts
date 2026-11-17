import type { DB, Kysely } from "@taiyomoe/db"
import type { ReportOutcome } from "./schemas"

/** Closes a pending report as resolved or dismissed, with an optional internal note. */
export const reviewUserReport = async (
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
    .selectFrom("userReports")
    .select("userId")
    .where("id", "=", reportId)
    .executeTakeFirst()

  if (report === undefined) {
    return { ok: false, error: "USER_REPORT_NOT_FOUND", userId: null } as const
  }

  const reviewed = await db
    .updateTable("userReports")
    .set({ status, reviewerId, reviewerNote: note })
    .where("id", "=", reportId)
    .where("status", "=", "PENDING")
    .returning("id")
    .executeTakeFirst()

  return reviewed === undefined
    ? ({ ok: false, error: "USER_REPORT_NOT_PENDING", userId: report.userId } as const)
    : ({ ok: true, userId: report.userId } as const)
}
