import { syncMedia } from "@taiyomoe/search"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkCover } from "../middlewares/check-cover-middleware"
import { checkMedia } from "../middlewares/check-media-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingSchema, languageSchema } from "../utils/schemas"

const updateCoverSchema = z
  .object({
    language: languageSchema("The language of the cover.").optional(),
    contentRating: contentRatingSchema("The content rating of the cover.").optional(),
    volume: z
      .number()
      .min(1)
      .nullable()
      .optional()
      .meta({ description: "The volume of the cover, or null to clear.", example: 2 }),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  })

export const updateCoverHandler = new Hono().patch(
  "/:id/covers/:coverId",
  describeRoute({
    summary: "Update a cover's metadata",
    description:
      "Patches the metadata of an existing cover. Any field omitted from the request body is left unchanged. To clear `volume`, send `null` explicitly. Promoting to main cover is done through the dedicated set-main endpoint.",
    tags: ["Medias"],
    requestBody: {
      content: { "application/json": await resolver(updateCoverSchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "Cover updated successfully.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the updated cover." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No cover with the given id exists under that media.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth("update", "Media"),
  validateJson(updateCoverSchema),
  checkMedia(),
  checkCover(),
  withTransaction,
  async (c) => {
    const { db, cover, media } = c.var
    const body = c.var.json
    const updates: Record<string, unknown> = {}

    if (body.language !== undefined) {
      updates.language = body.language
    }

    if (body.contentRating !== undefined) {
      updates.contentRating = body.contentRating
    }

    if (body.volume !== undefined) {
      updates.volume = body.volume === null ? null : String(body.volume)
    }

    await db.updateTable("covers").set(updates).where("id", "=", cover.id).execute()

    c.var.afterCommit(() => syncMedia(c.var.db, media.id))

    return c.ok({ id: cover.id })
  },
)
