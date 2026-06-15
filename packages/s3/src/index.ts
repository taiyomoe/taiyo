import { S3Client } from "@aws-sdk/client-s3"
import { env } from "./env"

export const getS3Client = () =>
  new S3Client({
    region: "auto",
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
  })

export const getS3Bucket = () => env.S3_BUCKET_NAME

export { DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3"

export const getCoverKey = (mediaId: string, fileName: string) =>
  `medias/${mediaId}/covers/${fileName}`

export const getBannerKey = (mediaId: string, fileName: string) =>
  `medias/${mediaId}/banners/${fileName}`

export const getStaffImageKey = (staffId: string, fileName: string) =>
  `staffs/${staffId}/${fileName}`
