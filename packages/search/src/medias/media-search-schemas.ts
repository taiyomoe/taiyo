import {
  CONTENT_RATINGS,
  FLAGS,
  MEDIA_COUNTRIES_OF_ORIGIN,
  MEDIA_DEMOGRAPHIES,
  MEDIA_LANGUAGES,
  MEDIA_SOURCES,
  MEDIA_STATUSES,
  MEDIA_TYPES,
  SUPPORTED_LANGUAGES,
} from "@taiyomoe/db"
import { paginationQuerySchema, sortDirectionSchema } from "@taiyomoe/schemas"
import { z } from "zod"
import {
  countFilter,
  dateFilter,
  enumArrayFilter,
  enumFilter,
  stringArrayFilter,
  uuidArrayFilter,
} from "../utils/filter-schemas"

const filterOn = <T extends z.ZodType>(filter: T, description: string) =>
  filter.optional().meta({ description })
const mediaFilterSchema = z
  .object({
    type: filterOn(enumFilter(MEDIA_TYPES), "Filters on the type of the media."),
    status: filterOn(enumFilter(MEDIA_STATUSES), "Filters on the release status of the media."),
    source: filterOn(enumFilter(MEDIA_SOURCES), "Filters on the original source of the media."),
    demography: filterOn(
      enumFilter(MEDIA_DEMOGRAPHIES),
      "Filters on the target audience of the media.",
    ),
    countryOfOrigin: filterOn(
      enumFilter(MEDIA_COUNTRIES_OF_ORIGIN),
      "Filters on the country the media originates from.",
    ),
    contentRating: filterOn(
      enumFilter(CONTENT_RATINGS),
      "Filters on the content rating of the media.",
    ),
    flag: filterOn(enumFilter(FLAGS), "Filters on the moderation flag of the media."),
    tags: filterOn(stringArrayFilter, "Filters on the keys of the media's tags."),
    spoilerTags: filterOn(stringArrayFilter, "Filters on the keys of the media's spoiler tags."),
    linkProviders: filterOn(
      stringArrayFilter,
      "Filters on the external sites the media has a link to, such as `mangaDex`.",
    ),
    links: filterOn(
      z
        .object({
          mangaDex: z.uuid().optional().meta({ description: "The MangaDex series UUID." }),
          anilist: z.int().positive().optional().meta({ description: "The AniList media ID." }),
          myAnimeList: z
            .int()
            .positive()
            .optional()
            .meta({ description: "The MyAnimeList media ID." }),
        })
        .strict(),
      "Filters on the media's IDs on external sites.",
    ),
    titleLanguages: filterOn(
      enumArrayFilter(MEDIA_LANGUAGES),
      "Filters on the languages of the media's titles.",
    ),
    chapterLanguages: filterOn(
      enumArrayFilter(SUPPORTED_LANGUAGES),
      "Filters on the languages of the media's chapters.",
    ),
    coverLanguages: filterOn(
      enumArrayFilter(MEDIA_LANGUAGES),
      "Filters on the languages of the media's covers.",
    ),
    authors: filterOn(uuidArrayFilter, "Filters on the IDs of the staff credited as authors."),
    artists: filterOn(uuidArrayFilter, "Filters on the IDs of the staff credited as artists."),
    createdAt: filterOn(dateFilter, "Filters on when the media was created."),
    updatedAt: filterOn(dateFilter, "Filters on when the media was last updated."),
    startDate: filterOn(dateFilter, "Filters on when the media started releasing."),
    endDate: filterOn(dateFilter, "Filters on when the media finished releasing."),
    libraryCount: filterOn(
      countFilter,
      "Filters on the number of users with the media in their library.",
    ),
    chapterCount: filterOn(countFilter, "Filters on the number of chapters of the media."),
  })
  .strict()
const mediaSortSchema = z
  .object({
    field: z
      .enum([
        "createdAt",
        "updatedAt",
        "startDate",
        "endDate",
        "mainTitle",
        "libraryCount",
        "chapterCount",
      ])
      .meta({ description: "The field to sort by.", example: "libraryCount" }),
    direction: sortDirectionSchema.default("desc"),
  })
  .array()
  .max(3)

export const searchMediasInputSchema = z
  .object({
    q: z.string().max(200).default("").meta({
      description:
        "The text to search for in the titles, synopses and staff names, tolerating typos. Empty matches every media.",
      example: "one punch",
    }),
    filter: mediaFilterSchema
      .default({})
      .meta({ description: "The filters every result must match." }),
    sort: mediaSortSchema.default([{ field: "createdAt", direction: "desc" }]).meta({
      description: "Up to 3 sort criteria, applied in order. Defaults to the newest medias first.",
    }),
  })
  .extend(paginationQuerySchema.shape)

export type MediaSort = z.infer<typeof mediaSortSchema>
