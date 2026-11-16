import { bannerAudit } from "@taiyomoe/audit"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { bulkIdsSchema, bulkResultSchema, partitionFound, skippedSchema } from "../utils/bulk"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingSchema } from "../utils/schemas"

const updateBannersSchema = z.object({
  bannerIds: bulkIdsSchema("banners", [
    "3f5acfdc-3b03-43b7-9851-f02b68e196d8",
    "42388adc-8a33-4554-b00c-2a4513078898",
  ]),
  contentRating: contentRatingSchema("The content rating of the banners."),
})
const skippedBannerSchema = skippedSchema(
  "banner",
  ["NOT_FOUND"],
  "Why the banner was left alone: it does not exist or is deleted.",
)

export const updateBannersHandler = new Hono().patch(
  "/",
  describeRoute({
    summary: "Update banners in bulk",
    description:
      "Sets the same `contentRating` on several banners at once. Banners that do not exist or are deleted are skipped and reported.\n\n**Required roles:** uploader intern, uploader, moderator, admin.",
    tags: ["Banners"],
    responses: {
      200: {
        description: "The updated and skipped banners.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(bulkResultSchema("banners", "updated", skippedBannerSchema)),
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
  audited(bannerAudit.UPDATE_MANY),
  withAuth("media.update"),
  validateJson(updateBannersSchema),
  withTransaction,
  async (c) => {
    const { db } = c.var
    const { bannerIds, ...updates } = c.var.json
    const rows = await db
      .selectFrom("banners")
      .select("id")
      .where("id", "in", bannerIds)
      .where("deletedAt", "is", null)
      .forUpdate()
      .execute()
    const { found, missing } = partitionFound(bannerIds, rows)
    const done = found.map((row) => row.id)

    if (done.length > 0) {
      await db.updateTable("banners").set(updates).where("id", "in", done).execute()
    }

    c.var.audit.set({ changes: { after: { bannerIds: done, ...updates } } })

    return c.ok({
      done,
      skipped: missing.map((id) => ({ id, reason: "NOT_FOUND" as const })),
    })
  },
)
