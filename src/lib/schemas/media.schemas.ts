import { z } from "zod";

import { TAG_KEYS } from "~/lib/i18n/tags";
import {
  insertMediaTitleSchema,
  updateMediaTitleSchema,
} from "~/lib/schemas/mediaTitles.schemas";

import { MediaSchema } from "./prisma";

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
  startDate: z.coerce.date().nullable(),
  endDate: z.coerce.date().nullable(),
  tags: z.array(
    z.object({
      key: z.enum(TAG_KEYS),
      isSpoiler: z.boolean(),
    }),
  ),
  mdTracker: z.string().uuid().optional(),
  alTracker: z.coerce.number().positive().min(30000).optional(),
  malTracker: z.coerce.number().positive().min(1).optional(),
  titles: insertMediaTitleSchema,
});

export const updateMediaSchema = insertMediaSchema
  .partial()
  .required({ id: true })
  .extend({
    titles: updateMediaTitleSchema,
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
export type UpdateMediaSchema = Required<typeof updateMediaSchema._type>;
export type ImportMediaSchema = typeof importMediaSchema._type;
