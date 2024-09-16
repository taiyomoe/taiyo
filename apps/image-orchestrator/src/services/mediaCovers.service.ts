import { type Prisma, db } from "@taiyomoe/db"
import { CoversService } from "@taiyomoe/services"
import { omit } from "radash"
import type { UploadCoverInput } from "../schemas"
import { FilesService } from "../services/files.service"
import type { UploadedFile } from "../types"

const getAll = async (mediaId: string) => {
  const result = await db.mediaCover.findMany({
    where: { mediaId, deletedAt: null },
  })

  return result
}

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

  await CoversService.postUpload("created", [result], uploaderId)

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

  await CoversService.postUpload("created", [result], uploaderId)

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

export const MediaCoversService = {
  getAll,
  insert,
  insertLimited,
  upload,
  uploadFromUrl,
}
