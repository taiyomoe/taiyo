import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, languageSchema } from "../utils/schemas"

const querySchema = z.object({
  language: languageSchema("Only list chapters in this language."),
})

export const listChapterNumbersHandler = new Hono().get(
  "/:id/chapter-numbers",
  describeRoute({
    summary: "List a media's chapter numbers",
    description:
      "Lists the numbers of a media's published chapters in one language, sorted, so uploaders can spot chapters that are already on Taiyō.\n\n**Authentication:** none.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "The chapter numbers.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(z.number().array())),
          },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given id exists.",
        422: "The query parameters failed validation.",
      }),
    },
  }),
  validateQuery(querySchema),
  checkMedia(),
  async (c) => {
    const rows = await c.var.db
      .selectFrom("chapters")
      .select("number")
      .distinct()
      .where("mediaId", "=", c.var.media.id)
      .where("language", "=", c.var.query.language)
      .where("status", "=", "PUBLISHED")
      .where("deletedAt", "is", null)
      .orderBy("number")
      .execute()

    return c.ok(rows.map((row) => row.number))
  },
)
