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
import { type MediaDocument, type MediaSort, searchMediasInputSchema } from "@taiyomoe/search"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import z from "zod"
import { rateLimit } from "../middlewares/rate-limit-middleware"
import { validateJson } from "../middlewares/validate-json-middleware"
import {
  apiErrorEnvelope,
  apiSuccessEnvelope,
  contentRatingSchema,
  languageSchema,
} from "../utils/schemas"

const quote = (value: string) => `"${value.replace(/"/g, '\\"')}"`
const enumOpsSchema = z.object({
  eq: z.string().optional(),
  neq: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
})
const arrayOpsSchema = z.object({
  hasAll: z.string().array().optional(),
  hasAny: z.string().array().optional(),
  hasNone: z.string().array().optional(),
})
const dateOpsSchema = z.object({
  before: z.string().optional(),
  after: z.string().optional(),
  between: z.tuple([z.string(), z.string()]).optional(),
  isNull: z.boolean().optional(),
})
const countOpsSchema = z.object({
  eq: z.number().optional(),
  gte: z.number().optional(),
  lte: z.number().optional(),
  between: z.tuple([z.number(), z.number()]).optional(),
})

type FilterSpec<TDocument> = Record<
  string,
  | { kind: "enum"; attr: keyof TDocument }
  | { kind: "array"; attr: keyof TDocument }
  | { kind: "date"; attr: keyof TDocument }
  | { kind: "count"; attr: keyof TDocument }
>

const sortFieldToAttribute = {
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  startDate: "startDate",
  endDate: "endDate",
  mainTitle: "_sortMainTitle",
  libraryCount: "libraryCount",
  chapterCount: "chapterCount",
} satisfies Record<MediaSort[number]["field"], string>
const mediaFilterSpec = {
  type: { kind: "enum", attr: "type" },
  status: { kind: "enum", attr: "status" },
  source: { kind: "enum", attr: "source" },
  demography: { kind: "enum", attr: "demography" },
  countryOfOrigin: { kind: "enum", attr: "countryOfOrigin" },
  contentRating: { kind: "enum", attr: "contentRating" },
  flag: { kind: "enum", attr: "flag" },
  tags: { kind: "array", attr: "tagKeys" },
  spoilerTags: { kind: "array", attr: "spoilerTagKeys" },
  linkProviders: { kind: "array", attr: "linkProviders" },
  titleLanguages: { kind: "array", attr: "titleLanguages" },
  chapterLanguages: { kind: "array", attr: "chapterLanguages" },
  coverLanguages: { kind: "array", attr: "coverLanguages" },
  authors: { kind: "array", attr: "authorIds" },
  artists: { kind: "array", attr: "artistIds" },
  createdAt: { kind: "date", attr: "createdAt" },
  updatedAt: { kind: "date", attr: "updatedAt" },
  startDate: { kind: "date", attr: "startDate" },
  endDate: { kind: "date", attr: "endDate" },
  libraryCount: { kind: "count", attr: "libraryCount" },
  chapterCount: { kind: "count", attr: "chapterCount" },
} satisfies FilterSpec<MediaDocument>
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
  libraryCount: z.number().int().meta({
    description: "How many readers have this media in their library.",
    example: 12_400,
  }),
  chapterCount: z
    .number()
    .int()
    .meta({ description: "How many chapters this media has.", example: 214 }),
})

export const searchMediasHandler = new Hono().post(
  "/search",
  describeRoute({
    summary: "Search medias",
    description:
      "Paginated, typo-tolerant search over medias. Use `q` for full-text search across titles, synopsis, and staff names. Use `filter` to narrow by enum, array, date, or count fields. Use `sort` to order by recency, title, chapter count, or how many readers have it in their library. Each result carries core metadata, the main title, the main cover id, and both popularity counts — fetch the detail endpoint for full relations.\n\n**Authentication:** none.",
    tags: ["Medias"],
    requestBody: {
      content: {
        "application/json": await resolver(searchMediasInputSchema).toOpenAPISchema(),
      },
    },
    responses: {
      200: {
        description: "Matching medias.",
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
      429: {
        description: "Too many requests — slow down.",
        content: { "application/json": { schema: resolver(apiErrorEnvelope) } },
      },
      500: {
        description: "An internal server error occurred.",
        content: { "application/json": { schema: resolver(apiErrorEnvelope) } },
      },
    },
  }),
  rateLimit({ prefix: "search-medias", windowMs: 60_000, limit: 60 }),
  validateJson(searchMediasInputSchema),
  async (c) => {
    const input = c.var.json
    const filters: Record<string, unknown> = input.filter
    const clauses: string[] = []

    for (const [field, fieldSpec] of Object.entries(mediaFilterSpec)) {
      const raw = filters[field]

      if (raw === undefined) {
        continue
      }

      const { attr } = fieldSpec

      switch (fieldSpec.kind) {
        case "enum": {
          const ops = enumOpsSchema.parse(raw)

          if (ops.eq !== undefined) {
            clauses.push(`${attr} = ${quote(ops.eq)}`)
          }

          if (ops.neq !== undefined) {
            clauses.push(`${attr} != ${quote(ops.neq)}`)
          }

          if (ops.in !== undefined && ops.in.length > 0) {
            clauses.push(`${attr} IN [${ops.in.map(quote).join(", ")}]`)
          }

          if (ops.notIn !== undefined && ops.notIn.length > 0) {
            clauses.push(`${attr} NOT IN [${ops.notIn.map(quote).join(", ")}]`)
          }

          break
        }

        case "array": {
          const ops = arrayOpsSchema.parse(raw)

          // hasAll → one equality per value; Meilisearch matches each against any
          // element of the array, so chaining with AND enforces "contains every".
          if (ops.hasAll !== undefined && ops.hasAll.length > 0) {
            for (const value of ops.hasAll) {
              clauses.push(`${attr} = ${quote(value)}`)
            }
          }

          if (ops.hasAny !== undefined && ops.hasAny.length > 0) {
            clauses.push(`${attr} IN [${ops.hasAny.map(quote).join(", ")}]`)
          }

          if (ops.hasNone !== undefined && ops.hasNone.length > 0) {
            clauses.push(`${attr} NOT IN [${ops.hasNone.map(quote).join(", ")}]`)
          }

          break
        }

        case "date": {
          const ops = dateOpsSchema.parse(raw)
          const ts = (iso: string) => new Date(iso).getTime()

          if (ops.before !== undefined) {
            clauses.push(`${attr} < ${ts(ops.before)}`)
          }

          if (ops.after !== undefined) {
            clauses.push(`${attr} > ${ts(ops.after)}`)
          }

          if (ops.between !== undefined) {
            clauses.push(`${attr} ${ts(ops.between[0])} TO ${ts(ops.between[1])}`)
          }

          if (ops.isNull === true) {
            clauses.push(`${attr} IS NULL`)
          }

          if (ops.isNull === false) {
            clauses.push(`${attr} IS NOT NULL`)
          }

          break
        }

        case "count": {
          const ops = countOpsSchema.parse(raw)

          if (ops.eq !== undefined) {
            clauses.push(`${attr} = ${ops.eq}`)
          }

          if (ops.gte !== undefined) {
            clauses.push(`${attr} >= ${ops.gte}`)
          }

          if (ops.lte !== undefined) {
            clauses.push(`${attr} <= ${ops.lte}`)
          }

          if (ops.between !== undefined) {
            clauses.push(`${attr} ${ops.between[0]} TO ${ops.between[1]}`)
          }

          break
        }
      }
    }

    const result = await c.var.meili.index<MediaDocument>(c.var.mediasIndex).search(input.q, {
      ...(clauses.length === 0 ? {} : { filter: clauses.join(" AND ") }),
      sort: input.sort.map((s) => `${sortFieldToAttribute[s.field]}:${s.direction}`),
      page: input.page,
      hitsPerPage: input.perPage,
    })

    return c.ok(result.hits, {
      page: result.page,
      perPage: result.hitsPerPage,
      total: result.totalHits,
    })
  },
)
