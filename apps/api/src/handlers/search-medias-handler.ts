import {
  FLAGS,
  LANGUAGES,
  MEDIA_COUNTRIES_OF_ORIGIN,
  MEDIA_DEMOGRAPHIES,
  MEDIA_SOURCES,
  MEDIA_STATUSES,
  MEDIA_TYPES,
} from "@taiyomoe/db"
import { paginationMetaSchema } from "@taiyomoe/schemas"
import { searchMedias, searchMediasInputSchema } from "@taiyomoe/search"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { validateJson } from "../middlewares/validate-json-middleware"
import {
  apiErrorEnvelope,
  apiSuccessEnvelope,
  contentRatingSchema,
  languageSchema,
} from "../utils/schemas"

const mediaHitSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the media." }),
  type: z.enum(MEDIA_TYPES).meta({ description: "The type of the media." }),
  status: z.enum(MEDIA_STATUSES).meta({ description: "The current release status." }),
  source: z.enum(MEDIA_SOURCES).meta({ description: "The original source of the media." }),
  demography: z.enum(MEDIA_DEMOGRAPHIES).meta({ description: "The target audience." }),
  countryOfOrigin: z.enum(MEDIA_COUNTRIES_OF_ORIGIN).meta({
    description: "The country where the media was originally created.",
  }),
  contentRating: contentRatingSchema("The content rating of the media."),
  flag: z.enum(FLAGS).meta({ description: "The moderation flag attached to the media." }),
  createdAt: z
    .number()
    .int()
    .meta({ description: "Creation timestamp (unix milliseconds).", example: 1704067200000 }),
  updatedAt: z
    .number()
    .int()
    .meta({ description: "Last update timestamp (unix milliseconds).", example: 1704067200000 }),
  startDate: z
    .number()
    .int()
    .nullable()
    .meta({ description: "Release start timestamp (unix milliseconds)." }),
  endDate: z
    .number()
    .int()
    .nullable()
    .meta({ description: "Release end timestamp (unix milliseconds)." }),
  tagKeys: z.string().array().meta({ description: "All tag keys attached to this media." }),
  spoilerTagKeys: z.string().array().meta({ description: "Tag keys marked as spoilers." }),
  linkProviders: z
    .string()
    .array()
    .meta({ description: "External link provider keys present on this media." }),
  titleLanguages: z.enum(LANGUAGES).array().meta({ description: "Languages with a title." }),
  chapterLanguages: z.enum(LANGUAGES).array().meta({ description: "Languages with chapters." }),
  coverLanguages: z.enum(LANGUAGES).array().meta({ description: "Languages with covers." }),
  authorIds: z.uuid().array().meta({ description: "Staff IDs credited as AUTHOR." }),
  artistIds: z.uuid().array().meta({ description: "Staff IDs credited as ARTIST." }),
  mainTitle: z
    .object({
      title: z.string().meta({ description: "The main title text." }),
      language: languageSchema("The language of the main title."),
    })
    .nullable()
    .meta({ description: "The main title of the media." }),
  mainCoverId: z
    .uuid()
    .nullable()
    .meta({ description: "The ID of the main cover, if one exists." }),
})

export const searchMediasHandler = new Hono().post(
  "/search",
  describeRoute({
    summary: "Search medias",
    description:
      "Returns a paginated, typo-tolerant list of medias matching a free-text query and a typed filter expression. Pass `q` for full-text search across titles, synopsis and credited staff names; pass `filter` to constrain the result set by enum, array and date fields; pass `sort` to override the default ordering. Each hit carries the media's core metadata, its main title and main cover ID — fetch the per-media detail endpoint for full relations.",
    tags: ["Medias"],
    requestBody: {
      content: {
        "application/json": await resolver(searchMediasInputSchema).toOpenAPISchema(),
      },
    },
    responses: {
      200: {
        description: "Medias matched successfully.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(mediaHitSchema.array(), paginationMetaSchema)),
          },
        },
      },
      422: {
        description: "The request data failed validation.",
        content: { "application/json": { schema: resolver(apiErrorEnvelope) } },
      },
      500: {
        description: "An internal server error occurred.",
        content: { "application/json": { schema: resolver(apiErrorEnvelope) } },
      },
    },
  }),
  validateJson(searchMediasInputSchema),
  async (c) => {
    const input = c.var.json!
    const { hits, page, perPage, total } = await searchMedias(input)

    return c.ok(hits, { page, perPage, total })
  },
)
