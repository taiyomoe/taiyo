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
  number: z.coerce.number().min(0).optional(),
  volume: z.coerce.number().min(0).nullish(),
  language: LanguagesSchema.optional(),
  contentRating: ContentRatingSchema.optional(),
  flag: FlagSchema.optional(),
  scanIds: z.string().uuid().array(),
})

export const bulkUpdateChaptersVolumesSchema = z.object({
  volumes: z
    .object({
      number: z.coerce.number().min(0).nullable(),
      ids: z.string().uuid().array().min(1),
    })
    .array(),
})

export const bulkUpdateChaptersScansSchema = z.object({
  scans: z
    .object({
      scanIds: z.string().uuid().array(),
      ids: z.string().uuid().array().min(1),
    })
    .array(),
})

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
export type BulkUpdateChaptersVolumesSchema =
  typeof bulkUpdateChaptersVolumesSchema._type
export type BulkUpdateChaptersScansSchema =
  typeof bulkUpdateChaptersScansSchema._type
