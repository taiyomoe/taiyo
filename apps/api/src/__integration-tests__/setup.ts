import type { GroupInvitationMail } from "@taiyomoe/email"
import "./setup-env"
import type { Hono } from "hono"
import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3"
import { createAuth } from "@taiyomoe/auth/server"
import { getDb } from "@taiyomoe/db"
import { env as dbEnv } from "@taiyomoe/db/env"
import { getS3Client } from "@taiyomoe/s3"
import { getMeiliClient, initMediasIndex } from "@taiyomoe/search"
import { setTimeout as sleep } from "node:timers/promises"
import pg from "pg"
import { afterAll, test as baseTest } from "vitest"
import type { Services } from "../services"
import { createApp } from "../app"
import { defined } from "./helpers/assert"
import { createFakeMangaDex, type FakeMangaDex } from "./helpers/mangadex"
import { createMemoryNotificationEvents } from "./helpers/notification-events"
import { createMemoryPushSender } from "./helpers/push-sender"

const TEMPLATE_DB = "taiyo_test_template"
const getDbUrl = (name: string) => {
  const url = new URL(dbEnv.DATABASE_URL)

  url.pathname = `/${name}`

  return url.toString()
}
const sanitize = (raw: string) => raw.replace(/[^a-z0-9]/gi, "_").toLowerCase()
const adminPool = new pg.Pool({ connectionString: getDbUrl("postgres"), max: 8 })
const sharedS3 = getS3Client()
const sharedMeili = getMeiliClient()
const fileDatabases: string[] = []
// pg-pool resolves `end()` once its clients leave the pool, before their sockets close: a
// forced drop right then kills a connection that is still saying goodbye, and the client
// reports it as an unhandled error. Wait until Postgres no longer sees them.
const waitForDisconnects = async (names: readonly string[]) => {
  for (let attempt = 0; attempt < 50; attempt++) {
    const { rows } = await adminPool.query<{ count: number }>(
      "SELECT count(*)::int AS count FROM pg_stat_activity WHERE datname = ANY($1)",
      [names],
    )

    if (rows[0]?.count === 0) {
      return
    }

    await sleep(100)
  }
}

// Each DROP DATABASE waits for a checkpoint: dropping the file's databases together shares one.
afterAll(async () => {
  await waitForDisconnects(fileDatabases)
  await Promise.all(
    fileDatabases.map((name) => adminPool.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`)),
  )
  await adminPool.end()
})

// Most tests never reach S3: the bucket is created right before the first command that needs it.
const getTestS3 = (bucket: string) => {
  const s3 = getS3Client()
  let created: Promise<unknown> | undefined

  s3.middlewareStack.add(
    (next) => async (args) => {
      created ??= sharedS3.send(new CreateBucketCommand({ Bucket: bucket }))
      await created

      return next(args)
    },
    { step: "initialize" },
  )

  return { s3, getCreated: () => created }
}
const emptyBucket = async (bucket: string) => {
  const listed = await sharedS3.send(new ListObjectsV2Command({ Bucket: bucket }))

  if (listed.Contents !== undefined && listed.Contents.length > 0) {
    await sharedS3.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: listed.Contents.map(({ Key }) => ({ Key: defined(Key) })) },
      }),
    )
  }

  await sharedS3.send(new DeleteBucketCommand({ Bucket: bucket }))
}

type Fixtures = {
  search: boolean
  services: Services
  app: Hono
  mails: GroupInvitationMail[]
  mangaDex: FakeMangaDex
}

const sentMails = new WeakMap<Services, GroupInvitationMail[]>()
const fakeMangaDexes = new WeakMap<Services, FakeMangaDex>()

export const test = baseTest.extend<Fixtures>({
  // Meilisearch runs its tasks one at a time: only the files that read the index opt in.
  search: false,
  services: async ({ task, search }, use) => {
    const dbName = `integration_${sanitize(task.id)}`
    const bucketName = `taiyo-test-${sanitize(task.id).replace(/_/g, "-")}`
    const mediasIndex = `medias_${sanitize(task.id)}`

    await adminPool.query(`DROP DATABASE IF EXISTS "${dbName}"`)
    await adminPool.query(`CREATE DATABASE "${dbName}" WITH TEMPLATE "${TEMPLATE_DB}"`)
    fileDatabases.push(dbName)

    const db = getDb(getDbUrl(dbName))
    const { s3, getCreated } = getTestS3(bucketName)

    if (search) {
      await initMediasIndex({ db, meili: sharedMeili, mediasIndex })
    }

    const mails: GroupInvitationMail[] = []
    const mangaDex = createFakeMangaDex()
    const services: Services = {
      db,
      s3,
      s3Bucket: bucketName,
      meili: sharedMeili,
      mediasIndex,
      auth: createAuth({ db, trustedOrigins: ["http://localhost"] }),
      chapterUploadQueue: { enqueue: async () => {} },
      mangaDex: mangaDex.client,
      mangaDexSyncQueue: mangaDex.queue,
      mailer: {
        sendGroupInvitation: (mail) => {
          mails.push(mail)

          return Promise.resolve()
        },
      },
      notificationEvents: createMemoryNotificationEvents(),
      pushSender: createMemoryPushSender(),
      vapidPublicKey: "test-vapid-public-key",
      cacheNamespace: `${crypto.randomUUID()}:`,
    }

    sentMails.set(services, mails)
    fakeMangaDexes.set(services, mangaDex)

    await use(services)

    await db.destroy()
    s3.destroy()

    if (getCreated() !== undefined) {
      await getCreated()
      await emptyBucket(bucketName)
    }

    // Elsewhere the index never exists: without a primary key, Meilisearch refuses to create it.
    if (search) {
      await sharedMeili.deleteIndex(mediasIndex)
    }
  },
  app: async ({ services }, use) => {
    await use(createApp(services))
  },
  mails: async ({ services }, use) => {
    await use(sentMails.get(services) ?? [])
  },
  mangaDex: async ({ services }, use) => {
    await use(defined(fakeMangaDexes.get(services)))
  },
})
