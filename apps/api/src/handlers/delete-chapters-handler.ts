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
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const deleteChaptersSchema = z.object({
  chapterIds: bulkIdsSchema("chapters", [
    "13548c83-8d1a-4163-8830-c8f16fcd2eb7",
    "9f1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d",
  ]),
})
const skippedChapterSchema = skippedSchema(
  "chapter",
  ["NOT_FOUND", "FORBIDDEN"],
  "Why the chapter was left alone: it does not exist, or you cannot delete it.",
)

export const deleteChaptersHandler = new Hono().delete(
  "/",
  describeRoute({
    summary: "Delete chapters in bulk",
    description:
      "Deletes several chapters at once, whatever their status. Chapters that do not exist or that you cannot delete are skipped and reported.\n\n**Required access:** for each chapter, the same access as deleting it.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "The deleted and skipped chapters.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(bulkResultSchema("chapters", "deleted", skippedChapterSchema)),
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
  audited(chapterAudit.DELETE_MANY),
  withAuth(),
  validateJson(deleteChaptersSchema),
  withTransaction,
  async (c) => {
    const { can, db, user } = c.var
    const { chapterIds } = c.var.json
    const rows = await db
      .selectFrom("chapters")
      .innerJoin("medias", "medias.id", "chapters.mediaId")
      .select(["chapters.id", "chapters.uploaderId", "chapters.status"])
      .where("chapters.id", "in", chapterIds)
      .where("chapters.deletedAt", "is", null)
      .where("medias.deletedAt", "is", null)
      .forUpdate("chapters")
      .execute()
    const { found, missing } = partitionFound(chapterIds, rows)
    const targets = await getChapterTargets(db, found)
    const allowed = (id: string) => {
      const target = targets.get(id)

      return target !== undefined && can("chapter.delete", target)
    }
    const done = found.filter((row) => allowed(row.id)).map((row) => row.id)

    if (done.length > 0) {
      await db
        .updateTable("chapters")
        .set({ deletedAt: new Date(), deleterId: user.id })
        .where("id", "in", done)
        .execute()
    }

    c.var.audit.set({ changes: { after: { chapterIds: done } } })

    return c.ok({
      done,
      skipped: [
        ...missing.map((id) => ({ id, reason: "NOT_FOUND" as const })),
        ...found
          .filter((row) => !allowed(row.id))
          .map((row) => ({ id: row.id, reason: "FORBIDDEN" as const })),
      ],
    })
  },
)
