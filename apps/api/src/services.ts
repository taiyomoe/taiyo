import type { S3Client } from "@aws-sdk/client-s3"
import type { Kysely } from "kysely"
import { type Auth, createAuth } from "@taiyomoe/auth/server"
import { type DB, getDb } from "@taiyomoe/db"
import { getChapterUploadProducer, type ChapterUploadProducer } from "@taiyomoe/queue"
import { getS3Bucket, getS3Client } from "@taiyomoe/s3"
import { getMeiliClient, type Meilisearch, SEARCH_INDEXES } from "@taiyomoe/search"
import { corsAllowedOrigins } from "./env"

export type Services = {
  db: Kysely<DB>
  s3: S3Client
  s3Bucket: string
  meili: Meilisearch
  mediasIndex: string
  auth: Auth
  chapterUploadQueue: ChapterUploadProducer
}

export const createServices = (): Services => {
  const db = getDb()

  return {
    db,
    s3: getS3Client(),
    s3Bucket: getS3Bucket(),
    meili: getMeiliClient(),
    mediasIndex: SEARCH_INDEXES.MEDIAS,
    auth: createAuth({ db, trustedOrigins: corsAllowedOrigins }),
    chapterUploadQueue: getChapterUploadProducer(),
  }
}
