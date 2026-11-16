import { type DB, type Kysely, sql } from "@taiyomoe/db"
import z from "zod"

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

/** Closes every open report on the pages of the given reports, and returns how many it closed. */
export const closePageReports = async (
  db: Kysely<DB>,
  {
    reports,
    status,
    resolverId,
  }: {
    reports: ReadonlyArray<{ chapterId: string; pageId: string }>
    status: z.infer<typeof closingStatusSchema>
    resolverId: string
  },
) => {
  if (reports.length === 0) {
    return 0
  }

  const result = await db
    .updateTable("pageReports")
    .set({ status, resolverId, resolvedAt: sql`CURRENT_TIMESTAMP` })
    .where("status", "=", "OPEN")
    .where((eb) =>
      eb.or(
        reports.map((report) =>
          eb.and([eb("chapterId", "=", report.chapterId), eb("pageId", "=", report.pageId)]),
        ),
      ),
    )
    .executeTakeFirst()

  return Number(result.numUpdatedRows)
}
