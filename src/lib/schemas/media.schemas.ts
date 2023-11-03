import { z } from "zod";

import { DEFAULT_MEDIA_PAGE, DEFAULT_MEDIA_PER_PAGE } from "../constants";
import {
  MediaSchema,
  MediaTagSchema,
  MediaTitleSchema,
  MediaTrackerSchema,
} from "./prisma";

export const insertMediaSchema = MediaSchema.pick({
  id: true,
  startDate: true,
  endDate: true,
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
    trackers: MediaTrackerSchema.pick({
      tracker: true,
      trackerMediaId: true,
    }).array(),
    titles: MediaTitleSchema.pick({
      title: true,
      language: true,
      isAcronym: true,
    })
      .array()
      .min(1),
    tags: MediaTagSchema.pick({
      isSpoiler: true,
      tagId: true,
    }).array(),
  }),
);

export const mediaPaginationSchema = z.object({
  page: z.coerce.number().default(DEFAULT_MEDIA_PAGE),
  perPage: z.coerce.number().default(DEFAULT_MEDIA_PER_PAGE),
});

export type InsertMediaSchema = typeof insertMediaSchema._type;
