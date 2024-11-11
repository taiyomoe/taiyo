import { PutObjectCommand, client } from "@taiyomoe/s3"
import { BaseFilesService } from "@taiyomoe/services"
import { parallel, tryit } from "radash"
import { env } from "../env"
import { PARALLEL_UPLOADS } from "../utils/constants"
import { ImagesService } from "./"

const upload = (baseKey: string) => async (file: File | Blob) => {
  const buffer = await file.arrayBuffer()
  const { id, mimeType, extension } = await BaseFilesService({
    debug: () => null,
  }).parse(Buffer.from(buffer))
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
  ...BaseFilesService,
  uploadFiles,
}
