import { randomUUID } from "crypto"
import { PutObjectCommand, client } from "@taiyomoe/s3"
import { fileTypeFromBuffer } from "file-type"
import sharp from "sharp"
import { env } from "~/env"
import { logger } from "~/logger"

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

  return await sharp(file).jpeg({ progressive: true, quality: 85 }).toBuffer()
}

const download = async (input: string) => {
  logger.debug(`Downloading file from: ${input}`)

  const response = await fetch(input)

  if (!response.ok) {
    throw new Error(`Failed to download file: ${input}`)
  }

  logger.debug(`Downloaded file from: ${input}`)

  return Buffer.from(await response.arrayBuffer())
}

const upload = async (baseKey: string, file: Buffer) => {
  const { id, mimeType, extension } = await parse(file)
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: `${baseKey}/${id}.${extension}`,
    ContentType: mimeType,
    Body: await compressImage(file, extension),
  })

  logger.debug(`Uploading file to S3: ${baseKey}/${id}.${extension}`)

  await client.send(command)

  logger.debug(`File uploaded to S3: ${baseKey}/${id}.${extension}`)

  return { id, extension }
}

export const FilesService = {
  download,
  upload,
}
