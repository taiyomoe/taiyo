import { z } from "zod";

import {
  DEFAULT_MEDIA_PAGE,
  DEFAULT_MEDIA_PER_PAGE,
  MEDIA_PER_PAGE_CHOICES,
} from "~/lib/constants";

import { ContentRatingSchema, FlagSchema, LanguagesSchema } from "./prisma";

export const insertMediaChapterSchema = z.object({
  id: z.string().uuid(),
  title: z.string().optional(),
  number: z.coerce.number().min(0).default(0),
  volume: z.coerce.number().min(0).optional(),
  language: LanguagesSchema,
  pages: z.array(z.string().uuid()),
  contentRating: ContentRatingSchema,
  flag: FlagSchema,
  mediaId: z.string().uuid(),
  scanIds: z.string().uuid().array(),
});

export const insertMediaChapterFormSchema = insertMediaChapterSchema.omit({
  id: true,
});

export const getMediaChapterByIdSchema = z.string();

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
});

export type InsertMediaChapterFormSchema =
  typeof insertMediaChapterFormSchema._type;
