import {
  DEFAULT_MEDIAS_LIST_PER_PAGE,
  MEDIAS_LIST_PER_PAGE_CHOICES,
  MEDIAS_LIST_QUERYABLE_FIELDS,
  MEDIAS_LIST_SORTABLE_FIELDS,
  TAG_KEYS,
} from "@taiyomoe/constants"
import { z } from "zod"
import { zfd } from "zod-form-data"
import { stringToJSON } from "zod_utilz"
import {
  pageSchema,
  perPageSchema,
  queryableFieldsSchema,
  sortableFieldsSchema,
} from "./common.schemas"
import {
  ContentRatingSchema,
  FlagSchema,
  LanguagesSchema,
  MediaCountryOfOriginSchema,
  MediaDemographySchema,
  MediaGenresSchema,
  MediaSourceSchema,
  MediaStatusSchema,
  MediaTypeSchema,
} from "./prisma"

export const createMediaSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  synopsis: z.string().min(1),
  oneShot: z.coerce.boolean().optional(),
  contentRating: ContentRatingSchema,
  type: MediaTypeSchema,
  status: MediaStatusSchema,
  source: MediaSourceSchema,
  demography: MediaDemographySchema,
  countryOfOrigin: MediaCountryOfOriginSchema,
  flag: FlagSchema,
  genres: zfd.repeatableOfType(MediaGenresSchema),
  tags: zfd.repeatableOfType(
    stringToJSON().pipe(
      z.object({ key: z.enum(TAG_KEYS), isSpoiler: z.boolean() }),
    ),
  ),
  mdId: z.string().uuid().optional(),
  alId: z.coerce.number().positive().min(30000).optional(),
  malId: z.coerce.number().positive().min(1).optional(),
  mainTitle: z.string().min(1),
  mainTitleLanguage: LanguagesSchema,
  mainCover: zfd.file(),
  mainCoverLanguage: LanguagesSchema,
  mainCoverContentRating: ContentRatingSchema.optional(),
  mainCoverVolume: z.coerce.number().int().positive().optional(),
})

export const importMediaSchema = z.object({
  mdId: z.string().uuid(),
  importCovers: z.coerce.boolean().default(true),
  importChapters: z.coerce.boolean().default(true),
})

export const syncMediaSchema = z.object({
  id: z.string().uuid(),
  importCovers: z.coerce.boolean().default(true),
  importChapters: z.coerce.boolean().default(true),
})

export const updateMediaSchema = z
  .object({
    id: z.string().uuid(),
    synopsis: z.string().min(1).nullable(),
    oneShot: z.boolean(),
    contentRating: ContentRatingSchema,
    type: MediaTypeSchema,
    status: MediaStatusSchema,
    source: MediaSourceSchema,
    demography: MediaDemographySchema,
    countryOfOrigin: MediaCountryOfOriginSchema,
    flag: FlagSchema,
    startDate: z.coerce.date().nullable(),
    endDate: z.coerce.date().nullable(),
    genres: MediaGenresSchema.array(),
    tags: z.object({ key: z.enum(TAG_KEYS), isSpoiler: z.boolean() }).array(),
    mdId: z.string().uuid().optional(),
    alId: z.coerce.number().positive().min(30000).optional(),
    malId: z.coerce.number().positive().min(1).optional(),
  })
  .partial()
  .required({ id: true })

export const getMediasListSchema = z.object({
  query: queryableFieldsSchema(MEDIAS_LIST_QUERYABLE_FIELDS),
  filter: z.string().optional().default(""),
  sort: sortableFieldsSchema(MEDIAS_LIST_SORTABLE_FIELDS),
  page: pageSchema,
  perPage: perPageSchema(
    DEFAULT_MEDIAS_LIST_PER_PAGE,
    MEDIAS_LIST_PER_PAGE_CHOICES,
  ),
})

export type CreateMediaInput = z.infer<typeof createMediaSchema>
export type ImportMediaInput = Required<typeof importMediaSchema._type>
export type SyncMediaInput = Required<typeof syncMediaSchema._type>
export type UpdateMediaInput = Required<typeof updateMediaSchema._type>
