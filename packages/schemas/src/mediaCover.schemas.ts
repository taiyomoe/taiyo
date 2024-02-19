import { z } from "zod"

import { MediaCoverSchema } from "./prisma"

const mediaCoverSchema = MediaCoverSchema.pick({
  volume: true,
  contentRating: true,
  isMainCover: true,
  language: true,
})

export const uploadMediaCoverSchema = mediaCoverSchema.array()
export const createMediaCoversSchema = z.object({
  mediaId: z.string().uuid(),
  covers: mediaCoverSchema.extend({ id: z.string().uuid() }).array(),
})

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

export type UploadMediaCoverSchema = typeof uploadMediaCoverSchema._type
export type CreateMediaCoversSchema = typeof createMediaCoversSchema._type
export type UpdateMediaCoverSchema = typeof updateMediaCoverSchema._type
export type DeleteMediaCoverSchema = typeof deleteMediaCoverSchema._type
