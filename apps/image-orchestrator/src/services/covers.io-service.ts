import { type Prisma, db } from "@taiyomoe/db"
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

const uploadFromUrl = async (
  mediaId: string,
  url: string,
  callbacks: {
    onDownloadStart?: () => void
    onUploadStart?: () => void
    onUploadEnd?: () => void
  },
): Promise<UploadedFile> => {
  callbacks.onDownloadStart?.()

  const file = await fetch(url).then((res) => res.blob())

  callbacks.onUploadStart?.()

  const [uploaded] = await FilesService.uploadFiles(
    `medias/${mediaId}/covers`,
    [file],
  )

  callbacks.onUploadEnd?.()

  return uploaded!
}

export const CoversService = {
  ...BaseCoversService,
  insert,
  insertLimited,
  upload,
  uploadFromUrl,
}
