import { randomUUID } from "crypto"
import { GetObjectCommand, PutObjectCommand, s3Client } from "@taiyomoe/s3"
import { fileTypeFromBuffer } from "file-type"
import sharp from "sharp"
import { env } from "./env"

/**
 * Every file is converted to a JPEG file, except for GIF files.
 *
 * This function parses file type and returns the DESIRED file type and extension to use.
 *
 * @param file input file.
 * @returns parsed file type and extension.
 */
const parse = async (file: Buffer) => {
  const parsed = await fileTypeFromBuffer(file)

  if (!parsed) {
    throw new Error("Failed to parse the file type.")
  }

  return {
    id: randomUUID(),
    mimeType: parsed.mime === "image/gif" ? "image/gif" : "image/jpeg",
    extension: parsed.ext === "gif" ? "gif" : "jpg",
  }
}

const compressImage = async (file: Buffer, extension: string) => {
  if (extension === "gif") {
    return file
  }

  return await sharp(file, { failOn: "none" })
    .jpeg({ progressive: true, quality: 85 })
    .toBuffer()
}

const download = async (input: string) => {
  const response = await fetch(input)

  if (!response.ok) {
    throw new Error(`Failed to download file: ${input}`)
  }

  return Buffer.from(await response.arrayBuffer())
}

const downloadFromS3 = async (input: string) => {
  const command = new GetObjectCommand({
    Bucket: env.S3_UPLOADS_BUCKET_NAME,
    Key: input,
  })
  const result = await s3Client.send(command)

  if (!result.Body) {
    throw new Error(`Couldn't download the file ${input}`)
  }

  const byteArray = await result.Body.transformToByteArray()

  return Buffer.from(byteArray)
}

const upload = async (baseKey: string, file: Buffer) => {
  const { id, mimeType, extension } = await parse(file)
  const command = new PutObjectCommand({
    Bucket: env.S3_CDN_BUCKET_NAME,
    Key: `${baseKey}/${id}.${extension}`,
    ContentType: mimeType,
    Body: await compressImage(file, extension),
  })

  await s3Client.send(command)

  return { id, extension }
}

export const BaseFilesService = {
  parse,
  compressImage,
  download,
  downloadFromS3,
  upload,
}
