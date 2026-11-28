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
import { withOptionalAuth } from "../middlewares/with-auth-middleware"
import { getUserContentRatings } from "../utils/content-ratings"
import { getMainCoverUrls } from "../utils/latest-chapters"
import { getOpenApiResponses } from "../utils/openapi-helper"
import {
  apiSuccessEnvelope,
  contentRatingSchema,
  storedLanguageSchema,
  storedLocalizedTextSchema,
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
  rating: "ratingScore",
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
  ratingCount: { kind: "count", attr: "ratingCount" },
} satisfies FilterSpec<MediaDocument>
const unixMs = <T extends z.ZodType>(schema: T, description: string) =>
  schema.meta({ description: `${description} In Unix milliseconds.`, example: 1704067200000 })
const mediaHitSchema = z.object({
  id: z.uuid().meta({ description: "The ID of the media." }),
  type: z.enum(MEDIA_TYPES).meta({ description: "The type of the media.", example: "MANGA" }),
  status: z
    .enum(MEDIA_STATUSES)
    .meta({ description: "The release status of the media.", example: "RELEASING" }),
  source: z
    .enum(MEDIA_SOURCES)
    .meta({ description: "The original source of the media.", example: "ORIGINAL" }),
  demography: z
    .enum(MEDIA_DEMOGRAPHIES)
    .meta({ description: "The target audience of the media.", example: "SHOUNEN" }),
  countryOfOrigin: z
    .enum(MEDIA_COUNTRIES_OF_ORIGIN)
    .meta({ description: "The country the media originates from.", example: "JAPAN" }),
  contentRating: contentRatingSchema("The content rating of the media."),
  flag: z.enum(FLAGS).meta({ description: "The moderation flag of the media.", example: "OK" }),
  createdAt: unixMs(z.int(), "When the media was created."),
  updatedAt: unixMs(z.int(), "When the media was last updated."),
  startDate: unixMs(z.int().nullable(), "When the media started releasing, if any."),
  endDate: unixMs(z.int().nullable(), "When the media finished releasing, if any."),
  tagKeys: z
    .string()
    .array()
    .meta({ description: "The keys of the media's tags.", example: ["ACTION", "COMEDY"] }),
  spoilerTagKeys: z
    .string()
    .array()
    .meta({ description: "The keys of the media's spoiler tags.", example: ["TIME_TRAVEL"] }),
  linkProviders: z
    .string()
    .array()
    .meta({
      description: "The external sites the media has a link to.",
      example: ["mangaDex", "anilist"],
    }),
  titleLanguages: z
    .enum(LANGUAGES)
    .array()
    .meta({ description: "The languages of the media's titles.", example: ["en", "ja"] }),
  chapterLanguages: z
    .enum(LANGUAGES)
    .array()
    .meta({ description: "The languages of the media's published chapters.", example: ["en"] }),
  coverLanguages: z
    .enum(LANGUAGES)
    .array()
    .meta({ description: "The languages of the media's covers.", example: ["ja"] }),
  titles: z
    .string()
    .array()
    .meta({
      description: "Every title of the media.",
      example: ["One Punch Man", "ワンパンマン", "OPM"],
    }),
  synopsis: storedLocalizedTextSchema.meta({
    description: "The synopsis of the media, keyed by language code.",
  }),
  staffNames: z
    .string()
    .array()
    .meta({
      description: "The names of the staff credited on the media.",
      example: ["ONE", "Murata Yusuke"],
    }),
  authorIds: z.uuid().array().meta({ description: "The IDs of the staff credited as authors." }),
  artistIds: z.uuid().array().meta({ description: "The IDs of the staff credited as artists." }),
  mainTitle: z
    .object({
      title: z.string().meta({ description: "The text of the title.", example: "One Punch Man" }),
      language: storedLanguageSchema("The language of the title."),
    })
    .nullable()
    .meta({ description: "The main title of the media, if any." }),
  mainCoverId: z.uuid().nullable().meta({ description: "The ID of the main cover, if any." }),
  coverUrl: z.url().nullable().meta({ description: "The URL of the main cover, if any." }),
  libraryCount: z.int().meta({
    description: "The number of users with the media in their library.",
    example: 12_400,
  }),
  chapterCount: z
    .int()
    .meta({ description: "The number of published chapters of the media.", example: 214 }),
  ratingCount: z.int().meta({ description: "The number of ratings of the media.", example: 530 }),
  ratingAverage: z
    .number()
    .nullable()
    .meta({ description: "The average score of the media, if it has ratings.", example: 8.6 }),
})

// oxlint-disable-next-line taiyo/require-audited-route
export const searchMediasHandler = new Hono().post(
  "/search",
  describeRoute({
    summary: "Search medias",
    description:
      "Searches medias by text, tolerating typos, in their titles, synopses and staff names. `filter` narrows the results, including by IDs on external sites with `links` (a media matches when any of the given IDs does), and `sort` orders them, newest first by default. Each result carries the details of the media, its main title and cover, and its popularity counts: get the media for its full details. Without a `contentRating` filter, results are limited to the content ratings of your settings, or to Normal and Suggestive when signed out.\n\n**Authentication:** optional.",
    tags: ["Medias"],
    responses: {
      201: {
        description: "The matching medias.",
        content: {
          "application/json": {
            schema: resolver(apiSuccessEnvelope(mediaHitSchema.array(), paginationMetaSchema)),
          },
        },
      },
      ...getOpenApiResponses({
        422: "The request body failed validation.",
        429: "Too many requests, try again later.",
      }),
    },
  }),
  rateLimit({ prefix: "search-medias", windowMs: 60_000, limit: 60 }),
  validateJson(searchMediasInputSchema),
  withOptionalAuth,
  async (c) => {
    const input = c.var.json
    const filters: Record<string, unknown> =
      input.filter.contentRating === undefined
        ? {
            ...input.filter,
            contentRating: { in: await getUserContentRatings(c.var.db, c.var.viewer?.id ?? null) },
          }
        : input.filter
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

    const links = Object.entries(input.filter.links ?? {})

    // Matches when any of the given links does, so a caller can try every id it knows at once.
    if (links.length > 0) {
      clauses.push(
        `linkValues IN [${links.map(([provider, value]) => quote(`${provider}:${value}`)).join(", ")}]`,
      )
    }

    const result = await c.var.meili.index<MediaDocument>(c.var.mediasIndex).search(input.q, {
      ...(clauses.length === 0 ? {} : { filter: clauses.join(" AND ") }),
      sort: input.sort.map((s) => `${sortFieldToAttribute[s.field]}:${s.direction}`),
      page: input.page,
      hitsPerPage: input.perPage,
    })
    const coverUrls = await getMainCoverUrls(
      c.var.db,
      result.hits.map((hit) => hit.id),
    )

    return c.ok(
      result.hits.map((hit) => ({ ...hit, coverUrl: coverUrls.get(hit.id) ?? null })),
      {
        page: result.page,
        perPage: result.hitsPerPage,
        total: result.totalHits,
      },
    )
  },
)
