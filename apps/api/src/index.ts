import { serve } from "@hono/node-server"
import { createAuth } from "@taiyomoe/auth/server"
import { getDb } from "@taiyomoe/db"
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
    cacheNamespace: "",
  })

  serve({ fetch: app.fetch, port: env.PORT }, ({ port }) => {
    // oxlint-disable-next-line no-console
    console.debug(`Server is running on http://localhost:${port}`)
  })
}
