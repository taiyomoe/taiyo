import { randomUUID } from "crypto"
import { PutObjectCommand, client } from "@taiyomoe/s3"
import { fileTypeFromBlob } from "file-type"
import { parallel, tryit } from "radash"
import { env } from "../env"
import { ImagesService } from "../services/images.service"
import { PARALLEL_UPLOADS } from "../utils/constants"

/**
 * Every file is converted to a JPEG file, except for GIF files.
 *
 * This function parses file type and returns the DESIRED file type and extension to use.
 *
 * @param file input file.
 * @returns parsed file type and extension.
 */
const parse = async (file: File | Blob) => {
  const parsed = await fileTypeFromBlob(file)

  if (!parsed) {
    throw new Error("Failed to parse the file type.")
  }

  return {
    id: randomUUID(),
    mimeType: parsed.mime === "image/gif" ? "image/gif" : "image/jpeg",
    extension: parsed.ext === "gif" ? "gif" : "jpg",
  }
}

const upload = (baseKey: string) => async (file: File | Blob) => {
  const { id, mimeType, extension } = await parse(file)
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: `${baseKey}/${id}.${extension}`,
    ContentType: mimeType,
    Body: await ImagesService.compress(file, extension),
  })

  await client.send(command)

  return { id, extension }
}

const uploadFiles = async (key: string, files: File[] | Blob[]) => {
  const [err, uploaded] = await tryit(parallel)(
    PARALLEL_UPLOADS,
    files,
    upload(key),
  )

  if (err) {
    console.error("Error uploading files.", err)

    throw new Error("Failed to upload files.")
  }

  return uploaded
}

export const FilesService = {
  uploadFiles,
}
