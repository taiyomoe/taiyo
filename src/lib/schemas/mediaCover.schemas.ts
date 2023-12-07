import { MediaCoverSchema } from "~/lib/schemas/prisma";

export const uploadMediaCoverSchema = MediaCoverSchema.pick({
  volume: true,
  contentRating: true,
  isMainCover: true,
  language: true,
}).array();

export const updateMediaCoverSchema = MediaCoverSchema.pick({
  id: true,
  volume: true,
  contentRating: true,
  isMainCover: true,
})
  .partial()
  .required({ id: true });

export type UploadMediaCoverSchema = typeof uploadMediaCoverSchema._type;
export type UpdateMediaCoverSchema = typeof updateMediaCoverSchema._type;
