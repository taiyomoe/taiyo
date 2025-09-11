import { z } from "zod"
import { chapterVolumeSchema, fileSchema } from "./common.schemas"
import { ContentRatingSchema, LanguagesSchema } from "./prisma"

export const uploadCoverSchema = z.object({
  volume: chapterVolumeSchema,
  contentRating: ContentRatingSchema,
  language: LanguagesSchema,
  mediaId: z.uuid(),
  file: fileSchema,
})

export type UploadCoverInput = z.infer<typeof uploadCoverSchema>
