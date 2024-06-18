import { z } from "zod"
import { MediaTitleSchema } from "./prisma"

const titleSchema = MediaTitleSchema.pick({
  title: true,
  language: true,
  priority: true,
  isAcronym: true,
  isMainTitle: true,
})

export const createTitleSchema = titleSchema
  .extend({ mediaId: z.string().uuid() })
  .refine((t) => t.title.length > 0, "Must be > 0")

export const updateTitleSchema = titleSchema
  .partial()
  .extend({ id: z.string().uuid() })
  .refine((t) => (t.title ? t.title.length > 0 : true), "Must be > 0")

export type CreateTitleInput = typeof createTitleSchema._type
export type UpdateTitleInput = typeof updateTitleSchema._type
