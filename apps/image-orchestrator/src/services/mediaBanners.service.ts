import { db } from "@taiyomoe/db"
import { omit } from "radash"
import type { UploadBannerInput } from "~/schemas"
import type { UploadedFile } from "~/types"
import { FilesService } from "./files.service"

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

export const MediaBannersService = {
  insert,
  upload,
}
