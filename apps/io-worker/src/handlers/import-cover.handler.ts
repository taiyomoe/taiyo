import { db } from "@taiyomoe/db"
import { BaseCoversService, BaseFilesService } from "@taiyomoe/services"
import type { ImportCoverMessageInput } from "@taiyomoe/types"
import { Cover } from "mangadex-full-api"
import { MdService } from "~/services/md.worker-service"
import { logger } from "~/utils/logger"

export const importCoverHandler = async (input: ImportCoverMessageInput) => {
  const rawCover = await Cover.get(input.mdId)
  const parsedCover = MdService.parseCover(rawCover)
  const coverBuffer = await BaseFilesService.download(parsedCover.url)

  await db.task.update({
    data: { status: "UPLOADING" },
    where: { id: input.taskId },
  })

  const uploadedCover = await BaseFilesService.upload(
    `medias/${input.mediaId}/covers`,
    coverBuffer,
  )
  const cover = await db.mediaCover.create({
    data: {
      id: uploadedCover.id,
      volume: parsedCover.volume,
      language: parsedCover.language,
      contentRating: input.contentRating,
      mediaId: input.mediaId,
      uploaderId: input.uploaderId,
    },
  })

  await BaseCoversService.postUpload(db, "imported", [cover])

  logger.info(`${input.uploaderId} imported a cover`, cover.id)

  return cover
}
