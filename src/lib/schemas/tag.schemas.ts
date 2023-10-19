import { TagSchema } from "./prisma";

export const insertTagSchema = TagSchema.pick({
  name: true,
  description: true,
  category: true,
  contentRating: true,
  alId: true,
});

export type InsertTagSchema = typeof insertTagSchema._type;
