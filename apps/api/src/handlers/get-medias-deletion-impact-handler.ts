import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { idsQuerySchema } from "../utils/bulk"
import { getMediaDeletionImpact, mediaDeletionCountsSchema } from "../utils/media-deletion-impact"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const querySchema = z.object({
  ids: idsQuerySchema("medias", [
    "4e26b80f-6661-4f5f-93b4-6dfed052bbed",
    "ed6d5cba-fbf9-40b3-8190-3c5d034e8413",
  ]),
})
const mediasDeletionImpactSchema = mediaDeletionCountsSchema.extend({
  featured: z.int().meta({
    description: "The number of these medias featured on the home page.",
    example: 1,
  }),
})

export const getMediasDeletionImpactHandler = new Hono().get(
  "/deletion-impact",
  describeRoute({
    summary: "Get what deleting several medias affects",
    description:
      "Returns what disappears from the site if you delete these medias together, counted across all of them. Medias that do not exist or are already deleted count for nothing.\n\n**Required roles:** uploader, admin.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "What deleting the medias affects.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(mediasDeletionImpactSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The query parameters failed validation.",
      }),
    },
  }),
  withAuth("media.delete"),
  validateQuery(querySchema),
  async (c) => {
    const { db } = c.var
    const rows = await db
      .selectFrom("medias")
      .select("id")
      .where("id", "in", c.var.query.ids)
      .where("deletedAt", "is", null)
      .execute()

    return c.ok(
      await getMediaDeletionImpact(
        db,
        rows.map((row) => row.id),
      ),
    )
  },
)
