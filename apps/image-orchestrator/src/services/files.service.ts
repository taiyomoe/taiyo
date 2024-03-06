import { randomUUID } from "crypto"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from "@nestjs/common"
import { fromBuffer } from "file-type"
import { parallel, tryit } from "radash"
import sharp from "sharp"

@Injectable()
export class FilesService implements OnModuleInit {
  #client: S3Client
  #PARALLEL_UPLOADS = 10

  async onModuleInit() {
    this.#client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.S3_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    })
  }

  async #parse(file: Express.Multer.File | ArrayBuffer) {
    const parsed = await fromBuffer(file instanceof ArrayBuffer ? file : file.buffer)

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

    await this.#client.send(command)

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
