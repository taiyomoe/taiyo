import {
  CreateBucketCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutBucketCorsCommand,
  PutBucketLifecycleConfigurationCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
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

export {
  CreateBucketCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutBucketCorsCommand,
  PutBucketLifecycleConfigurationCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
}

export const getCoverKey = (mediaId: string, fileName: string) =>
  `medias/${mediaId}/covers/${fileName}`

export const getBannerKey = (mediaId: string, fileName: string) =>
  `medias/${mediaId}/banners/${fileName}`

export const getPresignedUploadUrl = (
  s3: S3Client,
  bucket: string,
  key: string,
  contentType: string,
  expiresIn: number,
) =>
  getSignedUrl(s3, new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }), {
    expiresIn,
  })

export const getChapterPageKey = (mediaId: string, chapterId: string, pageId: string) =>
  `medias/${mediaId}/chapters/${chapterId}/${pageId}.jpg`

export const S3_PUBLIC_BASE = env.S3_PUBLIC_URL.replace(/\/+$/, "")

export const getCoverUrl = (mediaId: string, coverId: string, extension: string) =>
  `${S3_PUBLIC_BASE}/${getCoverKey(mediaId, `${coverId}.${extension}`)}`

export const getBannerUrl = (mediaId: string, bannerId: string, extension: string) =>
  `${S3_PUBLIC_BASE}/${getBannerKey(mediaId, `${bannerId}.${extension}`)}`

export const getStaffImageUrl = (key: string) => `${S3_PUBLIC_BASE}/${key}`
