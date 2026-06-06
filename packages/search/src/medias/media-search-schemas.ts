import {
  CONTENT_RATINGS,
  FLAGS,
  LANGUAGES,
  MEDIA_COUNTRIES_OF_ORIGIN,
  MEDIA_DEMOGRAPHIES,
  MEDIA_SOURCES,
  MEDIA_STATUSES,
  MEDIA_TYPES,
} from "@taiyomoe/db"
import { paginationQuerySchema, sortDirectionSchema } from "@taiyomoe/schemas"
import { z } from "zod"
import {
  dateFilter,
  enumArrayFilter,
  enumFilter,
  stringArrayFilter,
  uuidArrayFilter,
} from "../utils/filter-schemas"

export const mediaFilterSchema = z
  .object({
    type: enumFilter(MEDIA_TYPES).optional(),
    status: enumFilter(MEDIA_STATUSES).optional(),
    source: enumFilter(MEDIA_SOURCES).optional(),
    demography: enumFilter(MEDIA_DEMOGRAPHIES).optional(),
    countryOfOrigin: enumFilter(MEDIA_COUNTRIES_OF_ORIGIN).optional(),
    contentRating: enumFilter(CONTENT_RATINGS).optional(),
    flag: enumFilter(FLAGS).optional(),
    tags: stringArrayFilter.optional(),
    spoilerTags: stringArrayFilter.optional(),
    linkProviders: stringArrayFilter.optional(),
    titleLanguages: enumArrayFilter(LANGUAGES).optional(),
    chapterLanguages: enumArrayFilter(LANGUAGES).optional(),
    coverLanguages: enumArrayFilter(LANGUAGES).optional(),
    authors: uuidArrayFilter.optional(),
    artists: uuidArrayFilter.optional(),
    createdAt: dateFilter.optional(),
    updatedAt: dateFilter.optional(),
    startDate: dateFilter.optional(),
    endDate: dateFilter.optional(),
  })
  .strict()

export const mediaSortSchema = z
  .object({
    field: z.enum(["createdAt", "updatedAt", "startDate", "endDate", "mainTitle"]),
    direction: sortDirectionSchema.default("desc"),
  })
  .array()
  .max(3)

export const searchMediasInputSchema = z
  .object({
    q: z.string().max(200).default(""),
    filter: mediaFilterSchema.default({}),
    sort: mediaSortSchema.default([{ field: "createdAt", direction: "desc" }]),
  })
  .extend(paginationQuerySchema.shape)

export type MediaSort = z.infer<typeof mediaSortSchema>

export type SearchMediasInput = z.infer<typeof searchMediasInputSchema>
