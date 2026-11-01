import type { S3Client } from "@aws-sdk/client-s3"
import type { Auth } from "@taiyomoe/auth/server"
import type { DB } from "@taiyomoe/db"
import type { GroupInvitationMail } from "@taiyomoe/email"
import type { ChapterUploadProducer } from "@taiyomoe/queue"
import type { Meilisearch } from "@taiyomoe/search"
import type { Kysely } from "kysely"

export type Mailer = {
  sendGroupInvitation: (mail: GroupInvitationMail) => Promise<void>
}

export type Services = {
  db: Kysely<DB>
  s3: S3Client
  s3Bucket: string
  meili: Meilisearch
  mediasIndex: string
  auth: Auth
  chapterUploadQueue: ChapterUploadProducer
  mailer: Mailer
  cacheNamespace: string
}
