import { z } from "zod"

import {
  DEFAULT_MEDIA_PAGE,
  DEFAULT_MEDIA_PER_PAGE,
  MEDIA_PER_PAGE_CHOICES,
} from "~/lib/constants"

import { ContentRatingSchema, FlagSchema, LanguagesSchema } from "./prisma"

export const insertMediaChapterSchema = z.object({
  id: z.string().uuid(),
  title: z.string().nullable(),
  number: z.coerce.number().min(0).default(0),
  volume: z.coerce.number().min(0).nullable(),
  language: LanguagesSchema,
  pages: z.array(z.string().uuid()),
  contentRating: ContentRatingSchema,
  flag: FlagSchema,
  mediaId: z.string().uuid(),
  scanIds: z.string().uuid().array(),
})

export const insertMediaChapterFormSchema = insertMediaChapterSchema.omit({
  id: true,
  pages: true,
})

export const updateMediaChapterSchema = insertMediaChapterSchema
  .partial()
  .required({ id: true, scanIds: true })
  .omit({
    pages: true,
    mediaId: true,
  })

export const bulkUpdateMediaChapterVolumesSchema = z.array(
  z.object({
    volume: z.number().min(-1),
    ids: z.string().uuid().array(),
  }),
)

export const bulkUpdateMediaChapterScansSchema = z.array(
  z.object({
    scanIds: z.string().uuid().array(),
    ids: z.string().uuid().array(),
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

export type InsertMediaChapterFormSchema =
  typeof insertMediaChapterFormSchema._type
export type UpdateMediaChapterSchema = typeof updateMediaChapterSchema._type
export type BulkUpdateMediaChapterVolumesSchema =
  typeof bulkUpdateMediaChapterVolumesSchema._type
export type BulkUpdateMediaChapterScansSchema =
  typeof bulkUpdateMediaChapterScansSchema._type
