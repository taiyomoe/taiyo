import { S3Client } from "@aws-sdk/client-s3"
import { env } from "../env"

export const client = new S3Client({
  region: "auto",
  endpoint: env.S3_URL,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
})

export * from "@aws-sdk/client-s3"
