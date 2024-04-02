import { TAG_KEYS } from "@taiyomoe/constants"
import { z } from "zod"
import {
  ContentRatingSchema,
  FlagSchema,
  MediaCountryOfOriginSchema,
  MediaDemographySchema,
  MediaGenresSchema,
  MediaSourceSchema,
  MediaStatusSchema,
  MediaTypeSchema,
} from "./prisma"

export const updateMediaSchema = z
  .object({
    id: z.string().uuid(),
    synopsis: z.string().min(1).nullable(),
    contentRating: ContentRatingSchema,
    oneShot: z.boolean(),
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
    mdId z.string().uuid().optional(),
    alTracker: z.coerce.number().positive().min(30000).optional(),
    malTracker: z.coerce.number().positive().min(1).optional(),
  })
  .partial()
  .required({ id: true })

export const getMediaByIdSchema = z.string()

export const searchMediaSchema = z.object({
  title: z.string().min(1),
})

export const importMediaSchema = z.object({
  mdId: z.string().uuid(),
  synopsis: z.string().min(1),
})

export type UpdateMediaInput = Required<typeof updateMediaSchema._type>
export type ImportMediaSchema = typeof importMediaSchema._type
