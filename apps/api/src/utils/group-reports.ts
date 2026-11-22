import type { ReportOutcome } from "./schemas"
import { type ModerationContext, notifyModeration } from "./notifications/moderation"

/**
 * Closes a pending report in your name as resolved or dismissed, with an optional internal note,
 * and notifies the reporter of the outcome.
 */
export const reviewGroupReport = async (
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
    .selectFrom("groupReports")
    .select("groupId")
    .where("id", "=", reportId)
    .executeTakeFirst()

  if (report === undefined) {
    return { ok: false, error: "GROUP_REPORT_NOT_FOUND", groupId: null } as const
  }

  const reviewed = await db
    .updateTable("groupReports")
    .set({ status, reviewerId: user.id, reviewerNote: note })
    .where("id", "=", reportId)
    .where("status", "=", "PENDING")
    .returning("reporterId")
    .executeTakeFirst()

  if (reviewed === undefined) {
    return { ok: false, error: "GROUP_REPORT_NOT_PENDING", groupId: report.groupId } as const
  }

  await notifyModeration(context, [
    {
      type: "REPORT_REVIEWED",
      userId: reviewed.reporterId,
      payload: { kind: "GROUP", reportId, outcome: status, groupId: report.groupId },
    },
  ])

  return { ok: true, groupId: report.groupId } as const
}
