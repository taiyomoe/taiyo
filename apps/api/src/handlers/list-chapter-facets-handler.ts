import { LANGUAGES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { selectMediaChapters } from "../utils/media-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import { apiSuccessEnvelope, contentRatingsQuerySchema, languageSchema } from "../utils/schemas"

const querySchema = z.object({
  contentRating: contentRatingsQuerySchema,
  language: z
    .enum(LANGUAGES)
    .optional()
    .meta({ description: "Narrow the volume facet to this language." }),
})
const facetsSchema = z.object({
  total: z.int().meta({ description: "How many chapters match the language filter." }),
  volumes: z
    .object({
      volume: z.string().nullable().meta({ description: "The volume, or null for no volume." }),
      count: z.int().meta({ description: "How many chapters the volume has." }),
      firstNumber: z.number().meta({ description: "The lowest chapter number in the volume." }),
      lastNumber: z.number().meta({ description: "The highest chapter number in the volume." }),
    })
    .array()
    .meta({ description: "Volumes, latest first." }),
  languages: z
    .object({
      language: languageSchema("The language."),
      count: z.int().meta({ description: "How many chapters are in this language." }),
    })
    .array()
    .meta({ description: "Languages, most chapters first." }),
})

export const listChapterFacetsHandler = new Hono().get(
  "/:id/chapters/facets",
  describeRoute({
    summary: "List the chapter facets of a media",
    description:
      "Summarises the chapters of a media by volume and language, for building chapter filters. The language facet ignores the `language` filter.\n\n**Authentication:** none.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "Chapter facets of the media.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(facetsSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given id exists.",
        422: "The provided id is not a valid UUID or the query parameters failed validation.",
      }),
    },
  }),
  validateQuery(querySchema),
  checkMedia(),
  async (c) => {
    const { db, media } = c.var
    const { contentRating, language } = c.var.query
    const [volumes, languages] = await Promise.all([
      selectMediaChapters(db, media.id, { contentRatings: contentRating, language })
        .select((eb) => [
          "chapters.volume",
          eb.fn.countAll<string>().as("count"),
          eb.fn.min("chapters.number").as("firstNumber"),
          eb.fn.max("chapters.number").as("lastNumber"),
        ])
        .groupBy("chapters.volume")
        .orderBy("lastNumber", "desc")
        .orderBy("chapters.volume", "desc")
        .execute(),
      selectMediaChapters(db, media.id, { contentRatings: contentRating })
        .select((eb) => ["chapters.language", eb.fn.countAll<string>().as("count")])
        .groupBy("chapters.language")
        .orderBy("count", "desc")
        .orderBy("chapters.language", "asc")
        .execute(),
    ])
    const volumeFacets = volumes.map((row) => ({ ...row, count: Number(row.count) }))

    return c.ok({
      total: volumeFacets.reduce((sum, row) => sum + row.count, 0),
      volumes: volumeFacets,
      languages: languages.map((row) => ({ ...row, count: Number(row.count) })),
    })
  },
)
