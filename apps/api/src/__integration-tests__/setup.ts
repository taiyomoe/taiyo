import "./setup-env"

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
import type { Hono } from "hono"
import pg from "pg"
import { afterAll, test as baseTest } from "vitest"
import { createApp } from "../index"
import { type Services } from "../services"

const TEMPLATE_DB = "taiyo_test_template"
const getDbUrl = (name: string) => {
  const url = new URL(dbEnv.DATABASE_URL)

  url.pathname = `/${name}`

  return url.toString()
}
const sanitize = (raw: string) => raw.replace(/[^a-z0-9]/gi, "_").toLowerCase()
const getDbName = (taskId: string) => `integration_${sanitize(taskId)}`
const getBucketName = (taskId: string) => `taiyo-test-${sanitize(taskId).replace(/_/g, "-")}`
const getMediasIndex = (taskId: string) => `medias_${sanitize(taskId)}`
// Per-worker admin client. The template DB itself is provisioned in
// `global-setup.ts` so it exists across every worker before any test runs.
const adminClient = new pg.Client({ connectionString: getDbUrl("postgres") })
const adminClientReady = adminClient.connect()
const sharedS3 = getS3Client()
const sharedMeili = getMeiliClient()

afterAll(async () => {
  await adminClient.end()
})

type Fixtures = {
  services: Services
  app: Hono
}

export const test = baseTest.extend<Fixtures>({
  services: async ({ task }, use) => {
    await adminClientReady

    const dbName = getDbName(task.id)
    const bucketName = getBucketName(task.id)
    const mediasIndex = getMediasIndex(task.id)

    await adminClient.query(`DROP DATABASE IF EXISTS "${dbName}"`)
    await adminClient.query(`CREATE DATABASE "${dbName}" WITH TEMPLATE "${TEMPLATE_DB}"`)

    const db = getDb(getDbUrl(dbName))

    await sharedS3.send(new CreateBucketCommand({ Bucket: bucketName }))
    await initMediasIndex({ db, meili: sharedMeili, mediasIndex })

    const services: Services = {
      db,
      s3: sharedS3,
      s3Bucket: bucketName,
      meili: sharedMeili,
      mediasIndex,
      auth: createAuth({ db }),
      chapterUploadQueue: { enqueue: async () => {} },
    }

    await use(services)

    await db.destroy()
    await adminClient.query(`DROP DATABASE IF EXISTS "${dbName}"`)

    const listed = await sharedS3.send(new ListObjectsV2Command({ Bucket: bucketName }))

    if (listed.Contents?.length) {
      await sharedS3.send(
        new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: { Objects: listed.Contents.map(({ Key }) => ({ Key: Key! })) },
        }),
      )
    }

    await sharedS3.send(new DeleteBucketCommand({ Bucket: bucketName }))
    await sharedMeili.deleteIndex(mediasIndex).catch(() => {
      // Index might not exist if init failed; swallow.
    })
  },
  app: async ({ services }, use) => {
    await use(createApp(services))
  },
})
