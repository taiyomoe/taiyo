import { MediaCoverSchema } from "./prisma"

export const updateMediaCoverSchema = MediaCoverSchema.pick({
  id: true,
  volume: true,
  contentRating: true,
  isMainCover: true,
  language: true,
})
  .partial()
  .required({ id: true })

export const deleteMediaCoverSchema = MediaCoverSchema.pick({
  id: true,
})

export type UpdateMediaCoverSchema = typeof updateMediaCoverSchema._type
export type DeleteMediaCoverSchema = typeof deleteMediaCoverSchema._type
