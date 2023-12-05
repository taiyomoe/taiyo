import { MediaCoverSchema } from "~/lib/schemas/prisma";

export const updateMediaCoverSchema = MediaCoverSchema.pick({
  id: true,
  volume: true,
  contentRating: true,
  isMainCover: true,
})
  .partial()
  .required({ id: true });

export type UpdateMediaCoverSchema = typeof updateMediaCoverSchema._type;
