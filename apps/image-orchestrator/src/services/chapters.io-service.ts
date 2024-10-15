import { randomUUID } from "crypto"
import { db } from "@taiyomoe/db"
import { BaseChaptersService } from "@taiyomoe/services"
import { omit } from "radash"
import { FilesService } from "."
import type { UploadChapterInput } from "../schemas"
import type { UploadedResource } from "../types"

const insert = async (
  type: "created" | "imported" | "synced",
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

  await BaseChaptersService.postUpload(type, [result])

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

export const ChaptersService = {
  ...BaseChaptersService,
  insert,
  upload,
}
