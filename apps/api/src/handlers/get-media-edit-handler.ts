import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { mediaEditViewSchema, readMediaEdit, withStaffNames } from "../utils/media-edit"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

export const getMediaEditHandler = new Hono().get(
  "/:id/edit",
  describeRoute({
    summary: "Get a media for editing",
    description:
      "Returns every editable field of a media, in the shape `PATCH /medias/{id}` and suggestions accept, along with your pending suggestion for the media, if any.\n\n**Authentication:** signed-in user.",
    tags: ["Media suggestions"],
    responses: {
      200: {
        description: "The editable fields of the media and your pending suggestion.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  current: mediaEditViewSchema
                    .required()
                    .meta({ description: "The current editable fields of the media." }),
                  suggestion: z
                    .object({
                      id: z.uuid().meta({ description: "The ID of the suggestion." }),
                      note: z
                        .string()
                        .nullable()
                        .meta({ description: "Your note for the reviewers, if any." }),
                      changes: mediaEditViewSchema.meta({
                        description: "The fields the suggestion changes, with their new values.",
                      }),
                    })
                    .nullable()
                    .meta({ description: "Your pending suggestion for the media, if any." }),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        404: "No media with the given ID exists.",
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  withAuth("media.suggest"),
  checkMedia(),
  async (c) => {
    const { db, media, user } = c.var
    const [current, pending] = await Promise.all([
      readMediaEdit(db, media.id),
      db
        .selectFrom("mediaSuggestions")
        .select(["id", "note", "changes"])
        .where("mediaId", "=", media.id)
        .where("authorId", "=", user.id)
        .where("status", "=", "PENDING")
        .executeTakeFirst(),
    ])
    const [currentView = {}, changes = {}] = await withStaffNames(db, [
      current,
      pending?.changes ?? {},
    ])

    return c.ok({
      current: currentView,
      suggestion: pending === undefined ? null : { id: pending.id, note: pending.note, changes },
    })
  },
)
