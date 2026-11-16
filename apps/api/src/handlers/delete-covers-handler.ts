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
import { apiSuccessEnvelope } from "../utils/schemas"

const deleteCoversSchema = z.object({
  coverIds: bulkIdsSchema("covers", [
    "e501e4be-de36-4b7a-ad7d-78ab350e28db",
    "525151dc-ecc2-43e7-aa4e-67e045b5c795",
  ]),
})
const skippedCoverSchema = skippedSchema(
  "cover",
  ["NOT_FOUND", "MAIN_COVER"],
  "Why the cover was left alone: it does not exist, or it is the main cover of its media.",
)

export const deleteCoversHandler = new Hono().delete(
  "/",
  describeRoute({
    summary: "Delete covers in bulk",
    description:
      "Deletes several covers at once. Covers that do not exist, and main covers, are skipped and reported: set another cover as main first.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
    tags: ["Covers"],
    responses: {
      200: {
        description: "The deleted and skipped covers.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(bulkResultSchema("covers", "deleted", skippedCoverSchema)),
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
  audited(coverAudit.DELETE_MANY),
  withAuth("media.update"),
  validateJson(deleteCoversSchema),
  withTransaction,
  async (c) => {
    const { db, user } = c.var
    const { coverIds } = c.var.json
    const rows = await db
      .selectFrom("covers")
      .select(["id", "isMainCover"])
      .where("id", "in", coverIds)
      .where("deletedAt", "is", null)
      .forUpdate()
      .execute()
    const { found, missing } = partitionFound(coverIds, rows)
    const done = found.filter((row) => !row.isMainCover).map((row) => row.id)

    if (done.length > 0) {
      await db
        .updateTable("covers")
        .set({ deletedAt: new Date(), deleterId: user.id })
        .where("id", "in", done)
        .execute()
    }

    c.var.audit.set({ changes: { after: { coverIds: done } } })

    return c.ok({
      done,
      skipped: [
        ...missing.map((id) => ({ id, reason: "NOT_FOUND" as const })),
        ...found
          .filter((row) => row.isMainCover)
          .map((row) => ({ id: row.id, reason: "MAIN_COVER" as const })),
      ],
    })
  },
)
