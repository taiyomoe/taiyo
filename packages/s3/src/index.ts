import {
  PutBucketLifecycleConfigurationCommand,
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
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutBucketLifecycleConfigurationCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"

export const getCoverKey = (mediaId: string, fileName: string) =>
  `medias/${mediaId}/covers/${fileName}`

export const getBannerKey = (mediaId: string, fileName: string) =>
  `medias/${mediaId}/banners/${fileName}`

export const getStaffImageKey = (staffId: string, fileName: string) =>
  `staffs/${staffId}/${fileName}`

/** Presigned PUT URL a client uses to upload one raw page directly to S3. */
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

/** Canonical key for a finished, processed chapter page. Always .jpg. */
export const getChapterPageKey = (mediaId: string, chapterId: string, pageId: string) =>
  `medias/${mediaId}/chapters/${chapterId}/${pageId}.jpg`

/** Staging key for a raw, not-yet-processed upload. Reaped after processing. */
export const getChapterStagingKey = (chapterId: string, uploadId: string, index: number) =>
  `staging/chapters/${chapterId}/${uploadId}/${index}`

/**
 * Idempotent: tells the bucket to expire raw objects under `staging/` after
 * `expiryDays`. Best-effort — some S3-compatible stores (RustFS / Garage) may
 * not implement the lifecycle API, so callers should catch + log, never crash.
 * This is the backstop for the reaper, not a replacement for it.
 */
export const ensureStagingLifecycle = (s3: S3Client, bucket: string, expiryDays: number) =>
  s3.send(
    new PutBucketLifecycleConfigurationCommand({
      Bucket: bucket,
      LifecycleConfiguration: {
        Rules: [
          {
            ID: "expire-staging",
            Status: "Enabled",
            Filter: { Prefix: "staging/" },
            Expiration: { Days: expiryDays },
          },
        ],
      },
    }),
  )
