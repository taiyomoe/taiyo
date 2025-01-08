import {
  DEFAULT_MEDIAS_LIST_PER_PAGE,
  MEDIAS_LIST_PER_PAGE_CHOICES,
  MEDIAS_LIST_SORTABLE_FIELDS,
  TAG_KEYS,
} from "@taiyomoe/constants"
import { z } from "zod"
import {
  dateFilterSchema,
  enumFilterSchema,
  fileSchema,
  mdIdSchema,
  nullableDateFilterSchema,
  pageSchema,
  perPageSchema,
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
  genres: MediaGenresSchema.array(),
  tags: z.object({ key: z.enum(TAG_KEYS), isSpoiler: z.boolean() }).array(),
  mdId: z.string().uuid().optional(),
  alId: z.coerce.number().positive().min(30000).optional(),
  malId: z.coerce.number().positive().min(1).optional(),
  mainTitle: z.string().min(1),
  mainTitleLanguage: LanguagesSchema,
  mainCover: fileSchema,
  mainCoverLanguage: LanguagesSchema,
  mainCoverContentRating: ContentRatingSchema.optional(),
  mainCoverVolume: z.coerce.number().int().positive().optional(),
})

export const importMediaSchema = z.object({
  mdId: mdIdSchema,
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
  createdAt: dateFilterSchema,
  updatedAt: dateFilterSchema,
  deletedAt: nullableDateFilterSchema,
  startDate: nullableDateFilterSchema,
  endDate: nullableDateFilterSchema,
  contentRating: enumFilterSchema(ContentRatingSchema),
  // one shot
  type: enumFilterSchema(MediaTypeSchema),
  status: enumFilterSchema(MediaStatusSchema),
  source: enumFilterSchema(MediaSourceSchema),
  demography: enumFilterSchema(MediaDemographySchema),
  countryOfOrigin: enumFilterSchema(MediaCountryOfOriginSchema),
  // genres
  // tags
  flag: enumFilterSchema(FlagSchema),
  sort: z
    .tuple([z.enum(MEDIAS_LIST_SORTABLE_FIELDS), z.enum(["asc", "desc"])])
    .array()
    .catch([["createdAt", "desc"]]),
  page: pageSchema,
  perPage: perPageSchema(
    DEFAULT_MEDIAS_LIST_PER_PAGE,
    MEDIAS_LIST_PER_PAGE_CHOICES,
  ),
})

export type CreateMediaInput = z.infer<typeof createMediaSchema>
export type ImportMediaInput = z.infer<typeof importMediaSchema>
export type SyncMediaInput = z.infer<typeof syncMediaSchema>
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>
export type GetMediasListInput = z.infer<typeof getMediasListSchema>
