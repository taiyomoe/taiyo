import { coverAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, partitionFound, skippedSchema } from "../utils/bulk"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingSchema, mediaLanguageSchema } from "../utils/schemas"

const updateCoversSchema = z
  .object({
    coverIds: bulkIdsSchema("covers", [
      "e501e4be-de36-4b7a-ad7d-78ab350e28db",
      "525151dc-ecc2-43e7-aa4e-67e045b5c795",
    ]),
    language: mediaLanguageSchema("The language of the covers.").exactOptional(),
    contentRating: contentRatingSchema("The content rating of the covers.").exactOptional(),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: "At least one field must be provided.",
  })
const skippedCoverSchema = skippedSchema(
  "cover",
  ["NOT_FOUND"],
  "Why the cover was left alone: it does not exist or is deleted.",
)

export const updateCoversHandler = new Hono().patch(
  "/",
  describeRoute({
    summary: "Update covers in bulk",
    description:
      "Sets the same `language` or `contentRating` on several covers at once. At least one field is required, and omitted fields are left unchanged. Covers that do not exist or are deleted are skipped and reported.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
    tags: ["Covers"],
    responses: {
      200: {
        description: "The updated and skipped covers.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(bulkResultSchema("covers", "updated", skippedCoverSchema)),
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
  audited(coverAudit.UPDATE_MANY),
  withAuth("media.update"),
  validateJson(updateCoversSchema),
  withTransaction,
  async (c) => {
    const { db } = c.var
    const { coverIds, ...updates } = c.var.json
    const rows = await db
      .selectFrom("covers")
      .select("id")
      .where("id", "in", coverIds)
      .where("deletedAt", "is", null)
      .forUpdate()
      .execute()
    const { found, missing } = partitionFound(coverIds, rows)
    const done = found.map((row) => row.id)

    if (done.length > 0) {
      await db.updateTable("covers").set(updates).where("id", "in", done).execute()
    }

    c.var.audit.set({ changes: { after: { coverIds: done, ...updates } } })

    return c.ok({
      done,
      skipped: missing.map((id) => ({ id, reason: "NOT_FOUND" as const })),
    })
  },
)
