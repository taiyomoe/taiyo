import { config } from "@taiyomoe/config"
import { z } from "zod"
import { fileSchema } from "./common.schemas"
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
  tags: z.object({ key: z.enum(config.tags), isSpoiler: z.boolean() }).array(),
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

export type CreateMediaInput = z.infer<typeof createMediaSchema>
