import { syncMedia } from "@taiyomoe/search"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkCover } from "../middlewares/check-cover-middleware"
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
  "/:id",
  describeRoute({
    summary: "Update a cover",
    description:
      "Updates the metadata of a cover. Omitted fields are kept as-is. Send `null` explicitly to clear `volume`. Promoting a cover to main is done through the dedicated set-main endpoint.\n\n**Required roles:** uploader, moderator, admin.",
    tags: ["Covers"],
    requestBody: {
      content: { "application/json": await resolver(updateCoverSchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "Cover updated.",
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
        404: "No cover with the given id exists.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth("update", "Media"),
  validateJson(updateCoverSchema),
  checkCover(),
  withTransaction,
  async (c) => {
    const { db, cover } = c.var
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

    c.var.afterCommit(() => syncMedia({ db: c.var.db, meili: c.var.meili }, cover.mediaId))

    return c.ok({ id: cover.id })
  },
)
