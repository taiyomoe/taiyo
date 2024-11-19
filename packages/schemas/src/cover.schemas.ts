import { z } from "zod"
import { chapterVolumeSchema, fileSchema } from "./common.schemas"
import {
  ContentRatingSchema,
  LanguagesSchema,
  MediaCoverSchema,
} from "./prisma"

export const uploadCoverSchema = z.object({
  volume: chapterVolumeSchema,
  contentRating: ContentRatingSchema,
  language: LanguagesSchema,
  mediaId: z.string().uuid(),
  file: fileSchema,
})

export const uploadCoversSchema = z.object({
  covers: uploadCoverSchema.omit({ mediaId: true }).array().min(1),
  mediaId: z.string().uuid(),
})

export const updateCoverSchema = MediaCoverSchema.pick({
  id: true,
  volume: true,
  contentRating: true,
  isMainCover: true,
  language: true,
})
  .extend({ volume: z.coerce.number().int().min(1).nullable() })
  .partial()
  .required({ id: true })

export type UploadCoverInput = typeof uploadCoverSchema._type
export type UploadCoversInput = typeof uploadCoversSchema._type
export type UpdateCoverInput = typeof updateCoverSchema._type
