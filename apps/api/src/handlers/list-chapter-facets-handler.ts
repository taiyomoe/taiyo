import { SUPPORTED_LANGUAGES } from "@taiyomoe/db"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { checkMedia } from "../middlewares/check-media-middleware"
import { validateQuery } from "../middlewares/validate-query-middleware"
import { selectMediaChapters } from "../utils/media-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  contentRatingsQuerySchema,
  storedLanguageSchema,
} from "../utils/schemas"

const querySchema = z.object({
  contentRating: contentRatingsQuerySchema,
  language: z.enum(SUPPORTED_LANGUAGES).optional().meta({
    description: "Only count the chapters in this language in `total` and `volumes`.",
    example: "en",
  }),
})
const facetsSchema = z.object({
  total: z.int().meta({ description: "The number of matching chapters.", example: 214 }),
  volumes: z
    .object({
      volume: z
        .string()
        .nullable()
        .meta({ description: "The volume, or `null` for chapters without one.", example: "12" }),
      count: z
        .int()
        .meta({ description: "The number of matching chapters in the volume.", example: 9 }),
      firstNumber: z
        .number()
        .meta({ description: "The lowest chapter number in the volume.", example: 101 }),
      lastNumber: z
        .number()
        .meta({ description: "The highest chapter number in the volume.", example: 110 }),
    })
    .array()
    .meta({ description: "The volumes of the matching chapters, latest first." }),
  languages: z
    .object({
      language: storedLanguageSchema("The language of the chapters."),
      count: z.int().meta({ description: "The number of chapters in the language.", example: 120 }),
    })
    .array()
    .meta({
      description: "The languages of the chapters, most chapters first, ignoring `language`.",
    }),
})

export const listChapterFacetsHandler = new Hono().get(
  "/:id/chapters/facets",
  describeRoute({
    summary: "List a media's chapter facets",
    description:
      "Lists the published chapters of a media counted by volume and by language, to build chapter filters. The language counts ignore the `language` filter.\n\n**Authentication:** none.",
    tags: ["Chapters"],
    responses: {
      200: {
        description: "The chapter facets of the media.",
        content: {
          "application/json": { schema: resolver(apiSuccessEnvelope(facetsSchema)) },
        },
      },
      ...getOpenApiResponses({
        404: "No media with the given ID exists.",
        451: "The media is locked, so its chapters are unavailable.",
        422: "The provided ID is not a valid UUID, or the query parameters failed validation.",
      }),
    },
  }),
  validateQuery(querySchema),
  checkMedia({ refuseLocked: true }),
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
