import { db } from "@taiyomoe/db"
import { omit } from "radash"
import { FilesService } from "."
import type { UploadBannerInput } from "../schemas"
import type { UploadedFile } from "../types"

const insert = async (
  input: UploadBannerInput,
  file: UploadedFile,
  uploaderId: string,
) => {
  const result = await db.mediaBanner.create({
    data: {
      ...omit(input, ["file"]),
      id: file.id,
      uploaderId,
    },
  })

  return result
}

const upload = async (mediaId: string, files: File[]) => {
  const uploaded = await FilesService.uploadFiles(
    `medias/${mediaId}/banners`,
    files,
  )

  return uploaded
}

export const BannersService = {
  insert,
  upload,
}
