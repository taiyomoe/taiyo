import { ContentRating, Languages } from "@taiyomoe/db"
import z from "zod"

export const languageSchema = (description: string) =>
  z.enum(Languages).meta({ description, example: "en" })

export const contentRatingSchema = (description: string) =>
  z.enum(ContentRating).meta({ description, example: "NORMAL" })

export const fileSchema = (description: string) =>
  z
    .file()
    .mime(["image/png", "image/jpeg", "image/gif", "image/webp"])
    .meta({ description })
