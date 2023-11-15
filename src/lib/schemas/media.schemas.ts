import { z } from "zod";

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
}).merge(
  z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    mdTracker: z.string().uuid().optional(),
    alTracker: z.coerce.number().positive().min(30000).optional(),
    malTracker: z.coerce.number().positive().min(1).optional(),
    titles: MediaTitleSchema.pick({
      title: true,
      language: true,
      isAcronym: true,
    })
      .array()
      .min(1)
      .refine(
        (titles) => titles.every((x) => x.title.length > 0),
        "Must be > 0",
      )
      .refine(
        (x) => new Set<string>([...x.map((x) => x.title)]).size === x.length,
        "Must be unique",
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
  }),
);

export const getMediaByIdSchema = z.string();

export type InsertMediaSchema = typeof insertMediaSchema._type;
