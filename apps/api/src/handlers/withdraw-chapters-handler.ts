import { chapterAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, partitionFound, skippedSchema } from "../utils/bulk"
import { getChapterTargets } from "../utils/chapter-target"
import { getWithdrawalRefusal, withdrawChapters } from "../utils/chapter-withdrawal"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const withdrawChaptersSchema = z.object({
  chapterIds: bulkIdsSchema("chapters", [
    "13548c83-8d1a-4163-8830-c8f16fcd2eb7",
    "9f1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d",
  ]),
})
const skippedChapterSchema = skippedSchema(
  "chapter",
  ["NOT_FOUND", "FORBIDDEN", "NOT_PENDING"],
  "Why the chapter was left alone: it does not exist, you did not upload it, or it is no longer uploading or waiting for review.",
)

export const withdrawChaptersHandler = new Hono().post(
  "/withdraw",
  describeRoute({
    summary: "Withdraw submitted chapters in bulk",
    description:
      "Withdraws several chapters you submitted at once, while they are still uploading or waiting for review. The chapters and their pages are deleted. Chapters that do not exist, that someone else uploaded, or that were already reviewed are skipped and reported.\n\n**Required access:** the user who uploaded each chapter.",
    tags: ["Chapter review"],
    responses: {
      201: {
        description: "The withdrawn and skipped chapters.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(bulkResultSchema("chapters", "withdrawn", skippedChapterSchema)),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The request body failed validation.",
      }),
    },
  }),
  audited(chapterAudit.WITHDRAW_MANY),
  withAuth(),
  validateJson(withdrawChaptersSchema),
  withTransaction,
  async (c) => {
    const { can, db, user } = c.var
    const { chapterIds } = c.var.json
    const rows = await db
      .selectFrom("chapters")
      .innerJoin("medias", "medias.id", "chapters.mediaId")
      .select([
        "chapters.id",
        "chapters.mediaId",
        "chapters.status",
        "chapters.uploaderId",
        "chapters.pages",
      ])
      .where("chapters.id", "in", chapterIds)
      .where("chapters.deletedAt", "is", null)
      .where("medias.deletedAt", "is", null)
      .forUpdate("chapters")
      .execute()
    const { found, missing } = partitionFound(chapterIds, rows)
    const targets = await getChapterTargets(db, found)
    const verdicts = found.map((row) => {
      const target = targets.get(row.id)

      return {
        row,
        refusal: target === undefined ? ("NOT_FOUND" as const) : getWithdrawalRefusal(can, target),
      }
    })
    const withdrawn = verdicts.flatMap(({ row, refusal }) => (refusal === null ? [row] : []))
    const done = withdrawn.map((row) => row.id)

    await withdrawChapters(c.var, user.id, withdrawn)

    c.var.audit.set({ changes: { after: { chapterIds: done } } })

    return c.ok({
      done,
      skipped: [
        ...missing.map((id) => ({ id, reason: "NOT_FOUND" as const })),
        ...verdicts.flatMap(({ row, refusal }) =>
          refusal === null ? [] : [{ id: row.id, reason: refusal }],
        ),
      ],
    })
  },
)
