import { db } from "@taiyomoe/db"
import { BaseCoversService } from "@taiyomoe/services"
import type { ImportCoverMessageInput } from "@taiyomoe/types"
import { omit } from "radash"
import { FilesService } from "~/services/files.worker-service"

export const importCoverHandler = async (input: ImportCoverMessageInput) => {
  await db.task.update({
    data: { status: "DOWNLOADING" },
    where: { id: input.taskId },
  })

  const coverBuffer = await FilesService.download(input.url)

  await db.task.update({
    data: { status: "UPLOADING" },
    where: { id: input.taskId },
  })

  const coverFile = await FilesService.upload(
    `medias/${input.mediaId}/covers`,
    coverBuffer,
  )
  const cover = await db.mediaCover.create({
    data: {
      id: coverFile.id,
      ...omit(input, ["url", "mediaId", "uploaderId"]),
      media: { connect: { id: input.mediaId } },
      uploader: { connect: { id: input.uploaderId } },
    },
  })

  await BaseCoversService.postUpload(db, "imported", [cover], input.taskId)
}
