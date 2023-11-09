import { z } from "zod";

import {
  ContentRatingSchema,
  FlagSchema,
  MediaChapterLanguagesSchema,
} from "./prisma";

export const insertMediaChapterSchema = z.object({
  id: z.string().uuid(),
  title: z.string().optional(),
  number: z.coerce.number().min(0).default(0),
  volume: z.coerce.number().min(0).optional(),
  language: MediaChapterLanguagesSchema,
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

export type InsertMediaChapterSchema = typeof insertMediaChapterSchema._type;
