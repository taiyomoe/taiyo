import { ContentRating, Flag, Languages } from "@taiyomoe/db"
import { Hono } from "hono"
import { z } from "zod"
import { zfd } from "zod-form-data"
import { withAuth } from "~/middlewares/auth.middleware"
import { withValidation } from "~/middlewares/validation.middleware"
import type { CustomContext } from "~/types"

export const chaptersUploadHandler = new Hono<CustomContext>()

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

chaptersUploadHandler.post(
  "/",
  withAuth([["mediaChapters", "create"]]),
  withValidation("form", uploadSchema),
  async ({ json, req, var: { logger, session, medias } }) => {
    const body = req.valid("form")
    const media = await medias.get(body.mediaId)

    logger.info(`${session.name} (${session.id}) started uploading a chapter.`)

    return json(media)
  },
)
