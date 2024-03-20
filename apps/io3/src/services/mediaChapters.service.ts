import { randomUUID } from "crypto"
import { db } from "@taiyomoe/db"
import { omit } from "radash"
import type { CreateChapterInput } from "~/schemas"
import type { UploadedResource } from "~/types"
import { FilesService } from "./files.service"

const insert = async (
  input: CreateChapterInput,
  resource: UploadedResource,
  uploaderId: string,
) => {
  const result = await db.mediaChapter.create({
    data: {
      ...omit(input, ["files", "scanIds"]),
      id: resource.id,
      pages: resource.files,
      language: "pt_br",
      scans: { connect: input.scanIds.map((id) => ({ id })) },
      uploaderId,
    },
  })

  return result
}

const upload = async (
  mediaId: string,
  files: File[],
): Promise<UploadedResource> => {
  const id = randomUUID()
  const uploaded = await FilesService.uploadFiles(
    `medias/${mediaId}/chapters/${id}`,
    files,
  )

  return { id, files: uploaded }
}

export const MediaChaptersService = {
  insert,
  upload,
}
