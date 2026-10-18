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
      "Returns every editable field of a media in the shape `PATCH /medias/:id` and suggestions accept, along with the current user's pending suggestion for it, if any.\n\n**Authentication:** signed-in user.",
    tags: ["Media suggestions"],
    responses: {
      200: {
        description: "The editable fields and the user's pending suggestion.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(
                z.object({
                  current: mediaEditViewSchema,
                  suggestion: z
                    .object({
                      id: z.uuid(),
                      note: z.string().nullable(),
                      changes: mediaEditViewSchema,
                    })
                    .nullable(),
                }),
              ),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given id exists.",
        422: "The provided id is not a valid UUID.",
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
