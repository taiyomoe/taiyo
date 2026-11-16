import { mediaAudit } from "@taiyomoe/audit"
import { config } from "@taiyomoe/config"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { audited } from "../middlewares/audited-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const setFeaturedMediasSchema = z.object({
  mediaIds: z
    .array(z.uuid())
    .max(config.input.maxFeaturedMedias)
    .refine((ids) => new Set(ids).size === ids.length, { message: "A media appears twice." })
    .meta({
      description: `The medias to feature on the home page, in the order it shows them, ${config.input.maxFeaturedMedias} at most. An empty list features none.`,
      examples: [["3f5acfdc-3b03-43b7-9851-f02b68e196d8", "42388adc-8a33-4554-b00c-2a4513078898"]],
    }),
})

export const setFeaturedMediasHandler = new Hono().put(
  "/featured",
  describeRoute({
    summary: "Set the featured medias",
    description:
      "Sets the medias the home page features and their order, replacing the current ones.\n\n**Required roles:** admin.",
    tags: ["Medias"],
    responses: {
      200: {
        description: "Featured medias set.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  mediaIds: z.uuid().array().meta({
                    description: "The featured medias, in the order the home page shows them.",
                  }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "One of the medias does not exist.",
        422: `The request body failed validation, or it lists a media twice or more than ${config.input.maxFeaturedMedias} medias.`,
      }),
    },
  }),
  audited(mediaAudit.FEATURED_SET),
  withAuth("media.feature"),
  validateJson(setFeaturedMediasSchema),
  withTransaction,
  async (c) => {
    const { db } = c.var
    const { mediaIds } = c.var.json
    const found =
      mediaIds.length === 0
        ? []
        : await db
            .selectFrom("medias")
            .select("id")
            .where("id", "in", mediaIds)
            .where("deletedAt", "is", null)
            .execute()

    if (found.length !== mediaIds.length) {
      return c.fail("MEDIA_NOT_FOUND")
    }

    const before = await db
      .selectFrom("featuredMedias")
      .select("mediaId")
      .orderBy("position", "asc")
      .execute()

    await db.deleteFrom("featuredMedias").execute()

    if (mediaIds.length > 0) {
      await db
        .insertInto("featuredMedias")
        .values(mediaIds.map((mediaId, index) => ({ mediaId, position: index + 1 })))
        .execute()
    }

    c.var.audit.set({
      changes: {
        before: { mediaIds: before.map((row) => row.mediaId) },
        after: { mediaIds },
      },
    })

    return c.ok({ mediaIds })
  },
)
