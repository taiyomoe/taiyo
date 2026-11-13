import { serve } from "@hono/node-server"
import { createAuth } from "@taiyomoe/auth/server"
import { createNotificationEvents } from "@taiyomoe/cache/notification-events"
import { getDb } from "@taiyomoe/db"
import { sendGroupInvitationEmail } from "@taiyomoe/email"
import { getChapterUploadProducer } from "@taiyomoe/queue"
import { getS3Bucket, getS3Client } from "@taiyomoe/s3"
import { getMeiliClient, SEARCH_INDEXES } from "@taiyomoe/search"
import { type AppType, createApp } from "./app"
import { corsAllowedOrigins, env } from "./env"

export { createApp }

export type { AppType }

if ((process.env.TEST ?? "") === "") {
  const db = getDb()
  const app = createApp({
    db,
    s3: getS3Client(),
    s3Bucket: getS3Bucket(),
    meili: getMeiliClient(),
    mediasIndex: SEARCH_INDEXES.MEDIAS,
    auth: createAuth({ db, trustedOrigins: corsAllowedOrigins }),
    chapterUploadQueue: getChapterUploadProducer(),
    mailer: {
      sendGroupInvitation:
        process.env.NODE_ENV === "production" ? sendGroupInvitationEmail : () => Promise.resolve(),
    },
    notificationEvents: createNotificationEvents(),
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
