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
  /**
   * This takes a comma-separated list (raw string) of scan IDs.
   * The string is split into an array and then each string is trimmed.
   */
  scansIds: z.preprocess(
    (val) =>
      String(val ?? "")
        .split(",")
        .filter((x) => x.length > 0),
    z.array(z.string().trim().uuid()),
  ),
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

export type InsertMediaChapterSchema = typeof insertMediaChapterSchema._type;
