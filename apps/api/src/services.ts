import type { S3Client } from "@aws-sdk/client-s3"
import type { Auth } from "@taiyomoe/auth/server"
import type { NotificationEvents } from "@taiyomoe/cache/notification-events"
import type { DB } from "@taiyomoe/db"
import type { MangaDexClient } from "@taiyomoe/mangadex"
import type { ChapterUploadProducer, MangaDexSyncProducer, PushSender } from "@taiyomoe/queue"
import type { Meilisearch } from "@taiyomoe/search"
import type { Kysely } from "kysely"
import type { GroupInvitationMail } from "./emails/send-group-invitation-email"

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
  mangaDex: MangaDexClient
  mangaDexSyncQueue: MangaDexSyncProducer
  mailer: Mailer
  notificationEvents: NotificationEvents
  pushSender: PushSender | null
  vapidPublicKey: string | null
  cacheNamespace: string
}
