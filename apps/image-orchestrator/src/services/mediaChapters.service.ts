import { randomUUID } from "crypto"
import { cacheClient } from "@taiyomoe/cache"
import { db } from "@taiyomoe/db"
import { latestReleaseQuery } from "@taiyomoe/services/utils"
import { omit } from "radash"
import type { UploadChapterInput } from "../schemas"
import type { UploadedResource } from "../types"
import { FilesService } from "./files.service"

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

  const cached = await cacheClient.chapters.latest.get()

  if (!cached) {
    return result
  }

  const rawResult = await db.mediaChapter.findUnique({
    where: { id: result.id },
    select: latestReleaseQuery,
  })

  await cacheClient.chapters.latest.set([rawResult!, ...cached])

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
