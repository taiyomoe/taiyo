import type { ReportOutcome } from "./schemas"
import { type ModerationContext, notifyModeration } from "./notifications"

/**
 * Closes a pending report in your name as resolved or dismissed, with an optional internal note,
 * and notifies the reporter of the outcome.
 */
export const reviewUserReport = async (
  context: ModerationContext,
  {
    reportId,
    status,
    note,
  }: {
    reportId: string
    status: ReportOutcome
    note: string | null
  },
) => {
  const { db, user } = context
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
    .set({ status, reviewerId: user.id, reviewerNote: note })
    .where("id", "=", reportId)
    .where("status", "=", "PENDING")
    .returning("reporterId")
    .executeTakeFirst()

  if (reviewed === undefined) {
    return { ok: false, error: "USER_REPORT_NOT_PENDING", userId: report.userId } as const
  }

  await notifyModeration(context, [
    {
      type: "REPORT_REVIEWED",
      userId: reviewed.reporterId,
      payload: { kind: "USER", reportId, outcome: status, userId: report.userId },
    },
  ])

  return { ok: true, userId: report.userId } as const
}
