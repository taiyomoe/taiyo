import {
  CHAPTERS_LIST_PER_PAGE_CHOICES,
  CHAPTERS_LIST_SORTABLE_FIELDS,
  DEFAULT_CHAPTERS_LIST_PER_PAGE,
  DEFAULT_LATEST_CHAPTERS_GROUPED_PER_PAGE,
  DEFAULT_MEDIA_PER_PAGE,
  LATEST_CHAPTERS_GROUPED_PER_PAGE_CHOICES,
  MEDIA_PER_PAGE_CHOICES,
} from "@taiyomoe/constants"
import { z } from "zod"

import { zfd } from "zod-form-data"
import {
  pageSchema,
  perPageSchema,
  sortableFieldsSchema,
} from "./common.schemas"
import { ContentRatingSchema, FlagSchema, LanguagesSchema } from "./prisma"

export const uploadChapterSchema = z.object({
  title: z.string().optional(),
  number: z.coerce.number().positive().min(0),
  volume: z.coerce.number().positive().min(0).optional(),
  contentRating: ContentRatingSchema,
  flag: FlagSchema,
  language: LanguagesSchema,
  mediaId: z.string().uuid(),
  scanIds: zfd.repeatableOfType(z.string().uuid()),
  files: zfd.repeatable(zfd.file().array().min(1)),
})

export const uploadChaptersSchema = z.object({
  chapters: uploadChapterSchema.omit({ mediaId: true }).array().min(1),
  concurrent: z.coerce.number().int().positive().min(1),
  mediaId: z.string().uuid(),
})

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
  filter: z.string().optional().default(""),
  sort: sortableFieldsSchema(CHAPTERS_LIST_SORTABLE_FIELDS),
  page: pageSchema,
  perPage: perPageSchema(
    DEFAULT_CHAPTERS_LIST_PER_PAGE,
    CHAPTERS_LIST_PER_PAGE_CHOICES,
  ),
})

export type UploadChapterInput = z.infer<typeof uploadChapterSchema>
export type UploadChaptersInput = z.infer<typeof uploadChaptersSchema>
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
