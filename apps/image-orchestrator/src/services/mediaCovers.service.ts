import { type Prisma, db } from "@taiyomoe/db"
import { omit } from "radash"
import type { UploadCoverInput } from "../schemas"
import { FilesService } from "../services/files.service"
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

  return result
}

const insertLimited = async (
  file: UploadedFile,
  mediaId: string,
  uploaderId: string,
  client: Prisma.TransactionClient,
) => {
  const result = await client.mediaCover.create({
    data: {
      id: file.id,
      language: "ja",
      isMainCover: true,
      mediaId,
      uploaderId,
    },
  })

  return result
}

const upload = async (mediaId: string, files: File[]) => {
  const uploaded = await FilesService.uploadFiles(
    `medias/${mediaId}/covers`,
    files,
  )

  return uploaded
}

const uploadFromUrl = async (
  mediaId: string,
  url: string,
  options: { onDownload?: () => void; onUpload?: () => void },
): Promise<UploadedFile> => {
  options.onDownload?.()

  const file = await fetch(url).then((res) => res.blob())

  options.onUpload?.()

  const [uploaded] = await FilesService.uploadFiles(
    `medias/${mediaId}/covers`,
    [file],
  )

  return uploaded!
}

export const MediaCoversService = {
  insert,
  insertLimited,
  upload,
  uploadFromUrl,
}
