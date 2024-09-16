import { randomUUID } from "crypto"
import { db } from "@taiyomoe/db"
import { ChaptersService } from "@taiyomoe/services"
import { omit } from "radash"
import type { UploadChapterInput } from "../schemas"
import type { UploadedResource } from "../types"
import { FilesService } from "./files.service"

const getAll = async (mediaId: string) => {
  const result = await db.mediaChapter.findMany({
    where: { mediaId, deletedAt: null },
  })

  return result
}

const insert = async (
  input: UploadChapterInput,
  resource: UploadedResource,
  uploaderId: string,
) => {
  const result = await db.mediaChapter.create({
    data: {
      ...omit(input, ["files", "scanIds"]),
      id: resource.id,
      pages: resource.files,
      language: "pt_br",
      scans: { connect: (input.scanIds ?? []).map((id) => ({ id })) },
      uploaderId,
    },
  })

  await ChaptersService.postUpload("created", [result])

  return result
}

const upload = async (
  mediaId: string,
  files: File[] | Blob[],
): Promise<UploadedResource> => {
  const id = randomUUID()
  const uploaded = await FilesService.uploadFiles(
    `medias/${mediaId}/chapters/${id}`,
    files,
  )

  return { id, files: uploaded }
}

export const MediaChaptersService = {
  getAll,
  insert,
  upload,
}
