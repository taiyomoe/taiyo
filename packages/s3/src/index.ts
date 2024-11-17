import { S3Client } from "@aws-sdk/client-s3"
import { AwsClient } from "aws4fetch"
import { env } from "./env"

export const s3Client = new S3Client({
  region: "auto",
  endpoint: env.S3_URL,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
})

export const presignedClient = new AwsClient({
  region: "auto",
  accessKeyId: env.S3_ACCESS_KEY_ID,
  secretAccessKey: env.S3_SECRET_ACCESS_KEY,
})

export const getSignedUrl = async (
  key: string,
  contentType: string,
  contentLength: number,
) => {
  const result = await presignedClient.sign(
    new Request(
      `${env.S3_URL}/${env.S3_UPLOADS_BUCKET_NAME}/${key}?X-Amz-Expires=${300}`,
      { method: "PUT" },
    ),
    {
      aws: { signQuery: true, allHeaders: true },
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(contentLength),
      },
    },
  )

  return result.url
}

export * from "@aws-sdk/client-s3"
