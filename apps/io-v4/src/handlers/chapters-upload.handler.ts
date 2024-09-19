import { zValidator } from "@hono/zod-validator"
import { ContentRating, Flag, Languages } from "@taiyomoe/db"
import { Hono } from "hono"
import { z } from "zod"
import { zfd } from "zod-form-data"
import type { Context } from "../types"

export const chaptersUploadHandler = new Hono<Context>()

const uploadSchema = z.object({
  title: z.string().optional(),
  number: z.coerce.number().int().positive(),
  volume: z.coerce.number().int().positive().optional(),
  contentRating: z.nativeEnum(ContentRating),
  flag: z.nativeEnum(Flag),
  language: z.nativeEnum(Languages),
  mediaId: z.string().uuid(),
  scanIds: zfd.repeatableOfType(z.string().uuid()),
  files: zfd.repeatable(zfd.file().array().max(10)),
})

chaptersUploadHandler.post("/", zValidator("form", uploadSchema), (c) => {
  return c.text(c.var.t("medias.notFound", { name: "taiyo" }))
})
