import { db } from "@taiyomoe/db"
import { BaseCoversService, BaseFilesService } from "@taiyomoe/services"
import type { UploadCoverMessageInput } from "@taiyomoe/types"
import { omit } from "radash"

export const uploadCoverHandler = async (input: UploadCoverMessageInput) => {
  const coverFile = await BaseFilesService.downloadFromS3(input.cover)
  const uploadedCover = await BaseFilesService.upload(
    `medias/${input.id}/covers`,
    coverFile,
  )
  const cover = await db.mediaCover.create({
    data: {
      ...omit(input, ["id", "cover"]),
      id: uploadedCover.id,
    },
  })

  await BaseCoversService.postUpload(db, "created", [cover])

  return cover
}
