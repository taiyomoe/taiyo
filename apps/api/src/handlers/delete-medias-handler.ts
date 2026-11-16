import { mediaAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, partitionFound, skippedSchema } from "../utils/bulk"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const deleteMediasSchema = z.object({
  mediaIds: bulkIdsSchema("medias", [
    "4e26b80f-6661-4f5f-93b4-6dfed052bbed",
    "ed6d5cba-fbf9-40b3-8190-3c5d034e8413",
  ]),
})
const skippedMediaSchema = skippedSchema(
  "media",
  ["NOT_FOUND", "ALREADY_DELETED"],
  "Why the media was left alone: it does not exist, or it is already deleted.",
)

export const deleteMediasHandler = new Hono().delete(
  "/",
  describeRoute({
    summary: "Delete medias in bulk",
    description:
      "Deletes several medias at once: they no longer appear in listings, search results or detail routes. An admin can restore them later. Medias that do not exist or are already deleted are skipped and reported.\n\n**Required roles:** uploader, admin.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "The deleted and skipped medias.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(bulkResultSchema("medias", "deleted", skippedMediaSchema)),
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
  audited(mediaAudit.DELETE_MANY),
  withAuth("media.delete"),
  validateJson(deleteMediasSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { mediaIds } = c.var.json
    const rows = await db
      .selectFrom("medias")
      .select(["id", "deletedAt"])
      .where("id", "in", mediaIds)
      .forUpdate()
      .execute()
    const { found, missing } = partitionFound(mediaIds, rows)
    const done = found.filter((row) => row.deletedAt === null).map((row) => row.id)

    if (done.length > 0) {
      await db
        .updateTable("medias")
        .set({ deletedAt: new Date(), deleterId: user.id })
        .where("id", "in", done)
        .execute()
    }

    c.var.audit.set({ changes: { after: { mediaIds: done } } })

    return c.ok({
      done,
      skipped: [
        ...missing.map((id) => ({ id, reason: "NOT_FOUND" as const })),
        ...found
          .filter((row) => row.deletedAt !== null)
          .map((row) => ({ id: row.id, reason: "ALREADY_DELETED" as const })),
      ],
    })
  },
)
