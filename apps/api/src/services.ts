import type { S3Client } from "@aws-sdk/client-s3"
import { type Auth, createAuth } from "@taiyomoe/auth/server"
import { type DB, getDb } from "@taiyomoe/db"
import { getS3Bucket, getS3Client } from "@taiyomoe/s3"
import { getMeiliClient, type Meilisearch } from "@taiyomoe/search"
import type { Kysely } from "kysely"

export type Services = {
  db: Kysely<DB>
  s3: S3Client
  s3Bucket: string
  meili: Meilisearch
  auth: Auth
}

export const createServices = (): Services => {
  const db = getDb()

  return {
    db,
    s3: getS3Client(),
    s3Bucket: getS3Bucket(),
    meili: getMeiliClient(),
    auth: createAuth({ db }),
  }
}
