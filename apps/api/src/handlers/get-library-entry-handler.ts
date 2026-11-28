import { USER_LIBRARY_STATUSES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateParam } from "../middlewares/validate-param-middleware"
import { withAuth } from "../middlewares/with-auth-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const paramSchema = z.object({
  mediaId: z.uuid().meta({ description: "The ID of the media." }),
})
const libraryEntrySchema = z.object({
  mediaId: z.uuid().meta({ description: "The ID of the media." }),
  status: z
    .enum(USER_LIBRARY_STATUSES)
    .meta({ description: "Your reading status for the media.", example: "READING" }),
  notify: z.boolean().meta({ description: "Whether new chapters of the media notify you." }),
  createdAt: z.iso.datetime().meta({ description: "When you added the media to your library." }),
  updatedAt: z.iso.datetime().meta({ description: "When you last updated the entry." }),
})
const responseSchema = z.object({
  entry: libraryEntrySchema
    .nullable()
    .meta({ description: "Your library entry for the media, or null when it is not there." }),
  score: z
    .int()
    .nullable()
    .meta({ description: "Your score for the media, if you rated it.", example: 8 }),
})

export const getLibraryEntryHandler = new Hono().get(
  "/me/library/:mediaId",
  describeRoute({
    summary: "Get my library entry for a media",
    description:
      "Returns your library entry for the media, `null` when the media is not in your library, and the score you gave the media, `null` when you have not rated it.\n\n**Authentication:** signed-in user.",
    tags: ["Library"],
    responses: {
      200: {
        description: "Your library entry and score.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(responseSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        401: true,
        403: true,
        422: "The provided ID is not a valid UUID.",
      }),
    },
  }),
  withAuth(),
  validateParam(paramSchema),
  async (c) => {
    const { db, user } = c.var
    const { mediaId } = c.var.param
    const [entry, rating] = await Promise.all([
      db
        .selectFrom("userLibraryEntries")
        .select(["mediaId", "status", "notify", "createdAt", "updatedAt"])
        .where("userId", "=", user.id)
        .where("mediaId", "=", mediaId)
        .executeTakeFirst(),
      db
        .selectFrom("mediaRatings")
        .select("score")
        .where("userId", "=", user.id)
        .where("mediaId", "=", mediaId)
        .executeTakeFirst(),
    ])

    return c.ok({ entry: entry ?? null, score: rating?.score ?? null })
  },
)
