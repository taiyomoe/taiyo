import { randomUUID } from "crypto"
import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common"
import { PutObjectCommand, client } from "@taiyomoe/s3"
import { fileTypeFromBuffer } from "file-type"
import { parallel, tryit } from "radash"
import sharp from "sharp"

@Injectable()
export class FilesService {
  #PARALLEL_UPLOADS = 10

  async #parse(file: Express.Multer.File | ArrayBuffer) {
    const parsed = await fileTypeFromBuffer(file instanceof ArrayBuffer ? file : file.buffer)

    if (!parsed) throw new BadRequestException("There is at least one invalid file.")

    return {
      id: randomUUID(),
      mimeType: ["image/jpeg", "image/gif"].includes(parsed.mime) ? parsed.mime : "image/jpeg",
      extension: ["jpg", "gif"].includes(parsed.ext) ? parsed.ext : "jpg",
    }
  }

  async #compressImage(file: Express.Multer.File | ArrayBuffer, extension: string) {
    const buffer = file instanceof ArrayBuffer ? new Uint8Array(file) : file.buffer

    if (extension === "gif") return buffer

    return await sharp(buffer).jpeg({ progressive: true, quality: 85 }).toBuffer()
  }

  #upload = (baseKey: string) => async (file: Express.Multer.File | ArrayBuffer) => {
    const { id, mimeType, extension } = await this.#parse(file)
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${baseKey}/${id}.${extension}`,
      ContentType: mimeType,
      Body: await this.#compressImage(file, extension),
    })

    await client.send(command)

    return { id, extension }
  }

  async uploadFiles(key: string, files: Express.Multer.File[] | ArrayBuffer[]) {
    const [err, uploaded] = await tryit(parallel)(this.#PARALLEL_UPLOADS, files, this.#upload(key))

    if (err) {
      console.error("Error uploading files.", err)

      throw new InternalServerErrorException()
    }

    return uploaded
  }
}
