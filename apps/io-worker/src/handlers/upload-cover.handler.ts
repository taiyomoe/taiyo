import { db } from "@taiyomoe/db"
import { BaseCoversService, BaseFilesService } from "@taiyomoe/services"
import type { UploadCoverMessageInput } from "@taiyomoe/types"
import { omit } from "radash"
import { logger } from "~/utils/logger"

export const uploadCoverHandler = async (input: UploadCoverMessageInput) => {
  const coverFile = await BaseFilesService.downloadFromS3(input.cover)
  const uploadedCover = await BaseFilesService.upload(
    `medias/${input.mediaId}/covers`,
    coverFile,
  )
  const cover = await db.mediaCover.create({
    data: {
      ...omit(input, ["id", "cover"]),
      id: uploadedCover.id,
    },
  })

  await BaseCoversService.postUpload(db, "created", [cover])

  logger.info(`${input.uploaderId} uploaded a cover`, cover.id)

  return cover
}
