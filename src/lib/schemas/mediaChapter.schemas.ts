import { z } from "zod";

import { MediaChapterSchema } from "./prisma";

export const insertMediaChapterSchema = MediaChapterSchema.pick({
  id: true,
  title: true,
  number: true,
  volume: true,
  language: true,
  pages: true,
  contentRating: true,
  flag: true,
  mediaId: true,
}).merge(
  z.object({
    scansIds: z.array(z.string().uuid()),
  }),
);

export type InsertMediaChapterSchema = typeof insertMediaChapterSchema._type;
