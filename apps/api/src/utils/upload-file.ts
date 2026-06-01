import { PutObjectCommand, s3Bucket } from "@taiyomoe/s3"
import { AppContextVariables } from "../middlewares/context-middleware"

export const uploadFile = async (
  { s3, log }: Pick<AppContextVariables, "s3" | "log">,
  key: string,
  file: File,
) => {
  await s3.send(
    new PutObjectCommand({
      Bucket: s3Bucket,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    }),
  )

  log.set({ uploadedKeys: [key] })
}
