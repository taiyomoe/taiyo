import { z } from "zod";

import {
  DEFAULT_MEDIA_PAGE,
  DEFAULT_MEDIA_PER_PAGE,
  MEDIA_PER_PAGE_CHOICES,
} from "../constants";
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

export const getMediaByIdSchema = z.object({
  id: z.string(),
  page: z.number().optional().default(DEFAULT_MEDIA_PAGE),
  perPage: z
    .number()
    .optional()
    .default(DEFAULT_MEDIA_PER_PAGE)
    .refine((x) => MEDIA_PER_PAGE_CHOICES.includes(x), {
      message: `perPage must be one of ${MEDIA_PER_PAGE_CHOICES.join(", ")}`,
    }),
});

export const mediaPaginationSchema = z.object({
  page: z.coerce.number().catch(DEFAULT_MEDIA_PAGE),
  perPage: z.coerce
    .number()
    .refine((x) => MEDIA_PER_PAGE_CHOICES.includes(x))
    .catch(DEFAULT_MEDIA_PER_PAGE),
});

export type InsertMediaSchema = typeof insertMediaSchema._type;
