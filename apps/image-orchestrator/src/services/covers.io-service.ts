import { db } from "@taiyomoe/db"
import { BaseCoversService } from "@taiyomoe/services"
import { omit } from "radash"
import { FilesService } from "."
import type { UploadCoverInput } from "../schemas"
import type { UploadedFile } from "../types"

const insert = async (
  input: UploadCoverInput,
  file: UploadedFile,
  uploaderId: string,
) => {
  const result = await db.mediaCover.create({
    data: {
      ...omit(input, ["file"]),
      id: file.id,
      uploaderId,
    },
  })

  await BaseCoversService.postUpload(db, "created", [result])

  return result
}

const upload = async (mediaId: string, files: File[]) => {
  const uploaded = await FilesService.uploadFiles(
    `medias/${mediaId}/covers`,
    files,
  )

  return uploaded
}

export const CoversService = {
  ...BaseCoversService,
  insert,
  upload,
}
