import {
  CHAPTERS_LIST_PER_PAGE_CHOICES,
  DEFAULT_CHAPTERS_LIST_PER_PAGE,
  DEFAULT_LATEST_CHAPTERS_GROUPED_PER_PAGE,
  DEFAULT_MEDIA_PER_PAGE,
  LATEST_CHAPTERS_GROUPED_PER_PAGE_CHOICES,
  MEDIA_PER_PAGE_CHOICES,
} from "@taiyomoe/constants"
import { z } from "zod"

import {
  intsSchema,
  pageSchema,
  perPageSchema,
  uuidsSchema,
} from "./common.schemas"
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
  perPage: perPageSchema(DEFAULT_MEDIA_PER_PAGE, MEDIA_PER_PAGE_CHOICES),
})

export const getLatestChaptersGroupedSchema = z.object({
  page: pageSchema,
  perPage: perPageSchema(
    DEFAULT_LATEST_CHAPTERS_GROUPED_PER_PAGE,
    LATEST_CHAPTERS_GROUPED_PER_PAGE_CHOICES,
  ),
})

export const getChaptersByUserIdSchema = z.object({
  userId: z.string(),
  mediaId: z.string(),
})

export const getLatestChaptersGroupedByUserSchema = z.object({
  userId: z.string(),
  page: pageSchema,
  perPage: perPageSchema(
    DEFAULT_LATEST_CHAPTERS_GROUPED_PER_PAGE,
    LATEST_CHAPTERS_GROUPED_PER_PAGE_CHOICES,
  ),
})

export const getChaptersListSchema = z.object({
  numbers: intsSchema,
  notNumbers: intsSchema,
  volumes: intsSchema,
  notVolumes: intsSchema,
  languages: LanguagesSchema.array().optional().default([]),
  notLanguages: LanguagesSchema.array().array().optional().default([]),
  contentRatings: ContentRatingSchema.array().optional().default([]),
  notContentRatings: ContentRatingSchema.array().optional().default([]),
  flags: FlagSchema.array().optional().default([]),
  notFlags: FlagSchema.array().optional().default([]),
  uploaderIds: uuidsSchema,
  notUploaderIds: uuidsSchema,
  mediaIds: uuidsSchema,
  notMediaIds: uuidsSchema,
  scanIds: uuidsSchema,
  notScanIds: uuidsSchema,
  deleterIds: uuidsSchema,
  notDeleterIds: uuidsSchema,
  includeDeleted: z.boolean().optional().default(false),
  page: pageSchema,
  perPage: perPageSchema(
    DEFAULT_CHAPTERS_LIST_PER_PAGE,
    CHAPTERS_LIST_PER_PAGE_CHOICES,
  ),
})

export type UpdateChapterInput = typeof updateChapterSchema._type
export type BulkUpdateChaptersVolumesInput =
  typeof bulkUpdateChaptersVolumesSchema._type
export type BulkUpdateChaptersScansInput =
  typeof bulkUpdateChaptersScansSchema._type
export type GetLatestChaptersGroupedInput =
  typeof getLatestChaptersGroupedSchema._type
export type GetLatestChaptersGroupedByUserInput =
  typeof getLatestChaptersGroupedByUserSchema._type
export type GetChaptersListInput = typeof getChaptersListSchema._type
