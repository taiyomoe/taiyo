import { FLAGS } from "@taiyomoe/db"
import { syncMedia } from "@taiyomoe/search"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { withTransaction } from "../middlewares/with-transaction-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const flagMediaSchema = z.object({
  flag: z.enum(FLAGS).meta({
    description: "The new moderation flag to apply.",
    example: "STAFF_ONLY",
  }),
  reason: z.string().min(1).max(500).meta({
    description: "A short explanation for the change.",
    example: "Locked while we wait for a takedown response.",
  }),
})

export const flagMediaHandler = new Hono().post(
  "/:id/flag",
  describeRoute({
    summary: "Set a media's moderation flag",
    description:
      "Sets the moderation flag on a media. A reason must accompany the new flag.\n\n**Required roles:** moderator, admin.",
    tags: ["Medias"],
    requestBody: {
      content: { "application/json": await resolver(flagMediaSchema).toOpenAPISchema() },
    },
    responses: {
      200: {
        description: "Flag updated.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  id: z.uuid().meta({ description: "The ID of the media." }),
                  flag: z.enum(FLAGS).meta({ description: "The newly applied flag." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given id exists.",
        422: "The request data failed validation.",
      }),
    },
  }),
  withAuth("manage", "Media"),
  validateJson(flagMediaSchema),
  checkMedia(),
  withTransaction,
  async (c) => {
    const { db, log, media } = c.var
    const { flag, reason } = c.var.json

    log.set({ flagChange: { from: media.flag, to: flag, reason } })

    await db.updateTable("medias").set({ flag }).where("id", "=", media.id).execute()

    c.var.afterCommit(() =>
      syncMedia({ db: c.var.db, meili: c.var.meili, mediasIndex: c.var.mediasIndex }, media.id),
    )

    return c.ok({ id: media.id, flag })
  },
)
