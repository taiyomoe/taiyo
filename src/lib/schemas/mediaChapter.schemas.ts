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
  scansIds: z.array(z.string().uuid()),
});

export type InsertMediaChapterSchema = typeof insertMediaChapterSchema._type;
