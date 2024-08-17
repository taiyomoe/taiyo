import {
  DEFAULT_LATEST_CHAPTERS_GROUPED_PAGE,
  DEFAULT_LATEST_CHAPTERS_GROUPED_PER_PAGE,
  DEFAULT_MEDIA_PAGE,
  DEFAULT_MEDIA_PER_PAGE,
  LATEST_CHAPTERS_GROUPED_PER_PAGE_CHOICES,
  MEDIA_PER_PAGE_CHOICES,
} from "@taiyomoe/constants"
import { z } from "zod"

import { ContentRatingSchema, FlagSchema, LanguagesSchema } from "./prisma"

export const updateChapterSchema = z.object({
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

export const getMediaChaptersByMediaIdSchema = z.object({
  mediaId: z.string(),
  page: pageSchema,
})

export const getLatestChaptersGroupedSchema = z.object({
  page: pageSchema,
})

export type UpdateChapterInput = typeof updateChapterSchema._type
export type BulkUpdateChaptersVolumesInput =
  typeof bulkUpdateChaptersVolumesSchema._type
export type BulkUpdateChaptersScansInput =
  typeof bulkUpdateChaptersScansSchema._type
export type GetLatestChaptersGroupedInput =
  typeof getLatestChaptersGroupedSchema._type
