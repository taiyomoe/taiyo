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
