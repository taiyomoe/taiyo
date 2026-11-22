import { type DB, type Kysely, sql } from "@taiyomoe/db"
import z from "zod"
import { type ModerationContext, notifyModeration } from "./notifications/moderation"

export const closingStatusSchema = z.enum(["RESOLVED", "DISMISSED"]).meta({
  description:
    "How the reports are closed: `RESOLVED` once the page is fixed, `DISMISSED` when nothing was wrong.",
  example: "RESOLVED",
})

export const lockPageReports = (db: Kysely<DB>, ids: readonly string[]) =>
  db
    .selectFrom("pageReports")
    .select(["id", "chapterId", "pageId", "status"])
    .where("id", "in", ids)
    .forUpdate()
    .execute()

/**
 * Closes every open report on the pages of the given reports in your name, notifies each
 * reporter of the outcome, and returns how many it closed.
 */
export const closePageReports = async (
  context: ModerationContext,
  {
    reports,
    status,
  }: {
    reports: ReadonlyArray<{ chapterId: string; pageId: string }>
    status: z.infer<typeof closingStatusSchema>
  },
) => {
  if (reports.length === 0) {
    return 0
  }

  const closed = await context.db
    .updateTable("pageReports")
    .set({ status, resolverId: context.user.id, resolvedAt: sql`CURRENT_TIMESTAMP` })
    .where("status", "=", "OPEN")
    .where((eb) =>
      eb.or(
        reports.map((report) =>
          eb.and([eb("chapterId", "=", report.chapterId), eb("pageId", "=", report.pageId)]),
        ),
      ),
    )
    .returning(["id", "reporterId", "chapterId"])
    .execute()

  await notifyModeration(
    context,
    closed.map((report) => ({
      type: "REPORT_REVIEWED",
      userId: report.reporterId,
      payload: { kind: "PAGE", reportId: report.id, outcome: status, chapterId: report.chapterId },
    })),
  )

  return closed.length
}
