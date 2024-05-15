import { z } from "zod"
import { MediaCoverSchema } from "./prisma"

export const updateCoverSchema = MediaCoverSchema.pick({
  id: true,
  volume: true,
  contentRating: true,
  isMainCover: true,
  language: true,
})
  .extend({ volume: z.coerce.number().int().min(1).nullable() })
  .partial()
  .required({ id: true })

export const deleteCoverSchema = MediaCoverSchema.pick({
  id: true,
})

export type UpdateCoverInput = typeof updateCoverSchema._type
