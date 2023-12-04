import { z } from "zod";

import { TAG_KEYS } from "~/lib/i18n/tags";

import { ContentRatingSchema, MediaSchema, MediaTitleSchema } from "./prisma";

export const insertMediaSchema = MediaSchema.pick({
  id: true,
  synopsis: true,
  contentRating: true,
  oneShot: true,
  type: true,
  status: true,
  source: true,
  demography: true,
  countryOfOrigin: true,
  genres: true,
  flag: true,
}).extend({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  tags: z.array(
    z.object({
      key: z.enum(TAG_KEYS),
      isSpoiler: z.boolean(),
    }),
  ),
  mdTracker: z.string().uuid().optional(),
  alTracker: z.coerce.number().positive().min(30000).optional(),
  malTracker: z.coerce.number().positive().min(1).optional(),
  titles: MediaTitleSchema.pick({
    title: true,
    language: true,
    priority: true,
    isAcronym: true,
    isMainTitle: true,
  })
    .array()
    .min(1)
    .refine((t) => t.every((x) => x.title.length > 0), "Must be > 0")
    .refine(
      (t) => new Set<string>([...t.map((x) => x.title)]).size === t.length,
      "Must be unique",
    )
    .refine((t) => t.some((x) => x.isMainTitle), "Must have a main title")
    .refine(
      (t) => t.filter((x) => x.isMainTitle).length !== 1,
      "Must have only 1 main title",
    ),
  cover: z.object({
    id: z.string().uuid().optional(),
    volume: z.coerce.number().positive().nullable(),
    contentRating: ContentRatingSchema,
  }),
  banner: z.object({
    id: z.string().uuid().optional(),
    contentRating: ContentRatingSchema,
  }),
});

export const getMediaByIdSchema = z.string();

export const searchMediaSchema = z.object({
  title: z.string().min(1),
});

export const importMediaSchema = z.object({
  mdId: z.string().uuid(),
  synopsis: z.string().min(1),
});

export type InsertMediaSchema = typeof insertMediaSchema._type;
export type ImportMediaSchema = typeof importMediaSchema._type;
