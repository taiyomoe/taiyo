import { db } from "@taiyomoe/db"
import { BaseChaptersService, BaseFilesService } from "@taiyomoe/services"
import type { UploadChapterMessageInput } from "@taiyomoe/types"
import { omit, parallel } from "radash"
import { logger } from "~/utils/logger"

export const uploadChapterHandler = async (
  input: UploadChapterMessageInput,
) => {
  const pages = await parallel(10, input.pages, BaseFilesService.downloadFromS3)
  const uploadedPages = await parallel(10, pages, async (p) =>
    BaseFilesService.upload(`medias/${input.mediaId}/chapters/${input.id}`, p),
  )
  const chapter = await db.mediaChapter.create({
    data: {
      ...omit(input, ["scanIds", "pages"]),
      id: input.id,
      scans: { connect: input.scanIds.map((s) => ({ id: s })) },
      pages: uploadedPages,
      uploaderId: input.uploaderId,
    },
  })

  await BaseChaptersService.postUpload(db, "imported", [chapter])

  logger.info(`${input.uploaderId} uploaded a chapter`, chapter.id)

  return chapter
}
