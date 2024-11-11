import { randomUUID } from "crypto"
import { uploadChapterSchema } from "@taiyomoe/schemas"
import { BaseChaptersService } from "@taiyomoe/services"
import { Hono } from "hono"
import { omit, parallel } from "radash"
import { withAuth } from "~/middlewares/auth.middleware"
import { withValidation } from "~/middlewares/validation.middleware"
import { FilesService } from "~/services/files.io-service"
import type { CustomContext } from "~/types"

export const uploadChapterHandler = new Hono<CustomContext>()

uploadChapterHandler.post(
  "/",
  withAuth([["mediaChapters", "create"]]),
  withValidation("form", uploadChapterSchema),
  async ({ json, req, var: { logger, session, db, medias, scans } }) => {
    const body = req.valid("form")
    const media = await medias.getById(body.mediaId)
    const requestedScans = await scans.getAllById(body.scanIds)

    logger.info(`${session.id} started uploading a chapter`)

    const chapterId = randomUUID()
    const pageBuffers = await parallel(10, body.files, (f) => f.arrayBuffer())
    const pageFiles = await parallel(
      10,
      pageBuffers,
      async (b) =>
        await FilesService.upload(
          `medias/${media.id}/chapters/${chapterId}`,
          Buffer.from(b),
        ),
    )
    const chapter = await db.mediaChapter.create({
      data: {
        ...omit(body, ["files", "scanIds"]),
        id: chapterId,
        pages: pageFiles,
        scans: { connect: requestedScans.map((s) => ({ id: s.id })) },
        uploaderId: session.id,
      },
    })

    await BaseChaptersService.postUpload(db, "created", [chapter])

    logger.info(`${session.id} uploaded a chapter`)

    return json(chapter)
  },
)
