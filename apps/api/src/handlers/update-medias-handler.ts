import { mediaAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, partitionFound, skippedSchema } from "../utils/bulk"
import { mediaEditSchema } from "../utils/media-edit"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const fields = mediaEditSchema.pick({
  type: true,
  status: true,
  source: true,
  demography: true,
  countryOfOrigin: true,
  contentRating: true,
})
const updateMediasSchema = fields
  .extend({
    mediaIds: bulkIdsSchema("medias", [
      "4e26b80f-6661-4f5f-93b4-6dfed052bbed",
      "ed6d5cba-fbf9-40b3-8190-3c5d034e8413",
    ]),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: "At least one field must be provided.",
  })
const skippedMediaSchema = skippedSchema(
  "media",
  ["NOT_FOUND"],
  "Why the media was left alone: it does not exist or is deleted.",
)

export const updateMediasHandler = new Hono().patch(
  "/",
  describeRoute({
    summary: "Update medias in bulk",
    description:
      "Sets the same `type`, `status`, `source`, `demography`, `countryOfOrigin` or `contentRating` on several medias at once. At least one field is required, and omitted fields are left unchanged. Medias that do not exist or are deleted are skipped and reported.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "The updated and skipped medias.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(bulkResultSchema("medias", "updated", skippedMediaSchema)),
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
  audited(mediaAudit.UPDATE_MANY),
  withAuth("media.update"),
  validateJson(updateMediasSchema),
  withTransaction,
  async (c) => {
    const { db } = c.var
    const { mediaIds, ...updates } = c.var.json
    const rows = await db
      .selectFrom("medias")
      .select("id")
      .where("id", "in", mediaIds)
      .where("deletedAt", "is", null)
      .forUpdate()
      .execute()
    const { found, missing } = partitionFound(mediaIds, rows)
    const done = found.map((row) => row.id)

    if (done.length > 0) {
      await db.updateTable("medias").set(updates).where("id", "in", done).execute()
    }

    c.var.audit.set({ changes: { after: { mediaIds: done, ...updates } } })

    return c.ok({
      done,
      skipped: missing.map((id) => ({ id, reason: "NOT_FOUND" as const })),
    })
  },
)
