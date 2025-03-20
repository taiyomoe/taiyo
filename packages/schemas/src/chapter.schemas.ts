import { z } from "zod"
import {
  chapterNumberSchema,
  chapterVolumeSchema,
  fileSchema,
} from "./common.schemas"
import { ContentRatingSchema, FlagSchema, LanguagesSchema } from "./prisma"

export const uploadChapterSchema = z.object({
  title: z.string().optional(),
  number: chapterNumberSchema,
  volume: chapterVolumeSchema,
  contentRating: ContentRatingSchema,
  flag: FlagSchema,
  language: LanguagesSchema,
  mediaId: z.string().uuid(),
  scanIds: z.string().uuid().array(),
  files: fileSchema.array().min(1),
})

export type UploadChapterInput = z.infer<typeof uploadChapterSchema>
