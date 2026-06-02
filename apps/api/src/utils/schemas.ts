import { CONTENT_RATINGS, LANGUAGES } from "@taiyomoe/db"
import z from "zod"

export const apiSuccessEnvelope = <T extends z.ZodType, M extends z.ZodType = z.ZodNever>(
  data: T,
  meta?: M,
) =>
  z.object({
    success: z.literal(true),
    data,
    ...(meta ? { meta } : {}),
    timestamp: z.iso.datetime(),
    requestId: z.string(),
  })

export const paginationQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1)
    .meta({ description: "The page number to fetch, starting at 1.", example: 1 }),
  perPage: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .meta({ description: "The number of items per page (1-100).", example: 20 }),
})

export const paginationMetaSchema = z.object({
  page: z.int().meta({ description: "The current page number.", example: 1 }),
  perPage: z.int().meta({ description: "The number of items per page.", example: 20 }),
  total: z.int().meta({ description: "The total number of items.", example: 932 }),
})

export const apiErrorEnvelope = z.object({
  success: z.literal(false),
  code: z.string(),
  message: z.string(),
  timestamp: z.iso.datetime(),
  requestId: z.string(),
  details: z.unknown().optional(),
})

export const languageSchema = (description: string) =>
  z.enum(LANGUAGES).meta({ description, example: "en" })

export const contentRatingSchema = (description: string) =>
  z.enum(CONTENT_RATINGS).meta({ description, example: "NORMAL" })

export const fileSchema = (description: string) =>
  z.file().mime(["image/png", "image/jpeg", "image/gif", "image/webp"]).meta({ description })
