import { serve } from "@hono/node-server"
import { createAuth } from "@taiyomoe/auth/server"
import { createNotificationEvents } from "@taiyomoe/cache/notification-events"
import { getDb } from "@taiyomoe/db"
import { sendAuthEmail, sendGroupInvitationEmail } from "@taiyomoe/emails"
import { createMangaDexClient } from "@taiyomoe/mangadex"
import {
  createWebPushSender,
  getChapterUploadProducer,
  getDataExportProducer,
  getMangaDexSyncProducer,
  getVapidPublicKey,
} from "@taiyomoe/queue"
import { getS3Bucket, getS3Client, getS3PrivateBucket } from "@taiyomoe/s3"
import { getMeiliClient, SEARCH_INDEXES } from "@taiyomoe/search"
import { initLogger, log } from "evlog"
import { type AppType, createApp } from "./app"
import { corsAllowedOrigins, env } from "./env"
import { createAccountDeletion } from "./utils/account-deletion"

export { createApp }

export type { AppType }

if ((process.env.TEST ?? "") === "") {
  // Names the service in every log event; evlog falls back to "app".
  initLogger({ env: { service: "api" } })

  const db = getDb()
  const storage = {
    db,
    s3: getS3Client(),
    s3Bucket: getS3Bucket(),
    s3PrivateBucket: getS3PrivateBucket(),
    meili: getMeiliClient(),
    mediasIndex: SEARCH_INDEXES.MEDIAS,
  }
  const webOrigin = corsAllowedOrigins[0]
  const app = createApp({
    ...storage,
    auth: createAuth({
      db,
      trustedOrigins: corsAllowedOrigins,
      sendEmail: sendAuthEmail,
      // The deletion link opens the web app: without its origin, accounts cannot be deleted.
      ...(webOrigin === undefined
        ? {}
        : {
            accountDeletion: createAccountDeletion({
              ...storage,
              webOrigin,
              onError: (err) => {
                log.error("account-deletion", String(err))
              },
            }),
          }),
    }),
    chapterUploadQueue: getChapterUploadProducer(),
    mangaDex: createMangaDexClient(),
    mangaDexSyncQueue: getMangaDexSyncProducer(),
    dataExportQueue: getDataExportProducer(),
    mailer: {
      sendGroupInvitation:
        process.env.NODE_ENV === "production" ? sendGroupInvitationEmail : () => Promise.resolve(),
    },
    notificationEvents: createNotificationEvents(),
    pushSender: createWebPushSender(),
    vapidPublicKey: getVapidPublicKey(),
    cacheNamespace: "",
  })
  const server = serve({ fetch: app.fetch, port: env.PORT }, ({ port }) => {
    // oxlint-disable-next-line no-console
    console.debug(`Server is running on http://localhost:${port}`)
  })
  // Stop accepting connections, let in-flight requests finish, then release the pool.
  const handleShutdownSignal = () => {
    server.close(() => {
      db.destroy().then(
        () => process.exit(0),
        () => process.exit(1),
      )
    })
  }

  process.on("SIGTERM", handleShutdownSignal)
  process.on("SIGINT", handleShutdownSignal)
}
