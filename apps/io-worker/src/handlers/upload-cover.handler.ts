import { db } from "@taiyomoe/db"
import { BaseCoversService, BaseFilesService } from "@taiyomoe/services"
import type { UploadCoverMessageInput } from "@taiyomoe/types"
import { pick } from "radash"
import { logger } from "~/utils/logger"

export const uploadCoverHandler = async (input: UploadCoverMessageInput) => {
  const coverFile = await BaseFilesService.downloadFromS3(input.cover)
  const uploadedCover = await BaseFilesService.upload(
    `medias/${input.mediaId}/covers`,
    coverFile,
  )
  const cover = await db.mediaCover.create({
    data: {
      ...pick(input, [
        "volume",
        "contentRating",
        "language",
        "mediaId",
        "uploaderId",
      ]),
      id: uploadedCover.id,
    },
  })

  await BaseCoversService.postUpload(db, "created", [cover])

  logger.info(`${input.uploaderId} uploaded a cover`, cover.id)

  return cover
}
