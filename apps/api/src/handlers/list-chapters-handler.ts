import { CONTENT_RATINGS, FLAGS, LANGUAGES, sql } from "@taiyomoe/db"
import { paginationMetaSchema, paginationQuerySchema } from "@taiyomoe/schemas"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope } from "../utils/schemas"

const chapterListItemSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the chapter." }),
  title: z.string().nullable().meta({ description: "The title of the chapter, if any." }),
  number: z.number().meta({ description: "The chapter number." }),
  volume: z.string().nullable().meta({ description: "The volume of the chapter, if any." }),
  language: z.enum(LANGUAGES).meta({ description: "The language of the chapter." }),
  contentRating: z.enum(CONTENT_RATINGS).meta({ description: "The content rating." }),
  flag: z.enum(FLAGS).meta({ description: "Visibility flag of the chapter." }),
})

export const listChaptersHandler = new Hono().get(
  "/:id/chapters",
  describeRoute({
    summary: "List chapters of a media",
    description:
      "Lists the chapters of a media in ascending number order.\n\n**Authentication:** none.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "Chapters of the media.",
        content: {
          "application/json": {
            schema: resolver(
              apiSuccessEnvelope(chapterListItemSchema.array(), paginationMetaSchema),
            ),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given id exists.",
        422: "The provided id is not a valid UUID or the query parameters failed validation.",
      }),
    },
  }),
  validateQuery(paginationQuerySchema),
  checkMedia(),
  async (c) => {
    const { db, media } = c.var
    const { page, perPage } = c.var.query
    const [items, totalRow] = await Promise.all([
      db
        .selectFrom("chapters")
        .select(["id", "title", "number", "volume", "language", "contentRating", "flag"])
        .where("mediaId", "=", media.id)
        .where("deletedAt", "is", null)
        .orderBy("number", "asc")
        .orderBy("language", "asc")
        .limit(perPage)
        .offset((page - 1) * perPage)
        .execute(),
      db
        .selectFrom("chapters")
        .select(sql<string>`count(*)`.as("count"))
        .where("mediaId", "=", media.id)
        .where("deletedAt", "is", null)
        .executeTakeFirstOrThrow(),
    ])

    return c.ok(items, { page, perPage, total: Number(totalRow.count) })
  },
)
