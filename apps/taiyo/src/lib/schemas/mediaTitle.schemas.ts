import { z } from "zod"

import { MediaTitleSchema } from "~/lib/schemas/prisma"

const isEachTitleUnique = (t: { title: string; language: string }[]) =>
  new Set<string>([...t.map((x) => `${x.language}-${x.title}`)]).size ===
  t.length
const hasOnlyOneMainTitle = (t: { isMainTitle: boolean }[]) =>
  t.filter((x) => x.isMainTitle).length === 1

const mediaTitleSchema = MediaTitleSchema.pick({
  title: true,
  language: true,
  priority: true,
  isAcronym: true,
  isMainTitle: true,
})

export const createMediaTitleSchema = mediaTitleSchema
  .extend({ mediaId: z.string().uuid() })
  .refine((t) => t.title.length > 0, "Must be > 0")

export const createMediaTitlesSchema = mediaTitleSchema
  .array()
  .min(1)
  .refine(isEachTitleUnique, "Must be unique")
  .refine(hasOnlyOneMainTitle, "Must have one and only one main title")

export const updateMediaTitleSchema = mediaTitleSchema
  .partial()
  .extend({ id: z.string().uuid() })
  .refine((t) => (t.title ? t.title.length > 0 : true), "Must be > 0")

export type CreateMediaTitleSchema = typeof createMediaTitleSchema._type
export type CreateMediaTitlesSchema = typeof createMediaTitlesSchema._type
export type UpdateMediaTitleSchema = typeof updateMediaTitleSchema._type
