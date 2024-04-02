import {
  DEFAULT_MEDIA_PAGE,
  DEFAULT_MEDIA_PER_PAGE,
  MEDIA_PER_PAGE_CHOICES,
} from "@taiyomoe/constants"
import { z } from "zod"

import { ContentRatingSchema, FlagSchema, LanguagesSchema } from "./prisma"

export const updateMediaChapterSchema = z.object({
  id: z.string().uuid(),
  title: z.string().nullish(),
  number: z.coerce.number().min(0).nullable(),
  volume: z.coerce.number().min(0).nullable(),
  language: LanguagesSchema.optional(),
  contentRating: ContentRatingSchema.optional(),
  flag: FlagSchema.optional(),
  scanIds: z.string().uuid().array(),
})

export const bulkUpdateMediaChapterVolumesSchema = z.array(
  z.object({
    volume: z.coerce.number().min(-1),
    ids: z.string().uuid().array().min(1),
  }),
)

export const bulkUpdateMediaChapterScansSchema = z.array(
  z.object({
    scanIds: z.string().uuid().array(),
    ids: z.string().uuid().array().min(1),
  }),
)

export const getMediaChapterByIdSchema = z.string()

export const getMediaChaptersByMediaIdSchema = z.object({
  mediaId: z.string(),
  page: z.number().optional().default(DEFAULT_MEDIA_PAGE),
  perPage: z
    .number()
    .optional()
    .default(DEFAULT_MEDIA_PER_PAGE)
    .refine((x) => MEDIA_PER_PAGE_CHOICES.includes(x), {
      message: `perPage must be one of ${MEDIA_PER_PAGE_CHOICES.join(", ")}`,
    }),
})

export type UpdateMediaChapterSchema = typeof updateMediaChapterSchema._type
export type BulkUpdateMediaChapterVolumesSchema =
  typeof bulkUpdateMediaChapterVolumesSchema._type
export type BulkUpdateMediaChapterScansSchema =
  typeof bulkUpdateMediaChapterScansSchema._type
