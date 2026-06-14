import "./setup-env"

import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3"
import { createAuth } from "@taiyomoe/auth/server"
import { cacheClient } from "@taiyomoe/cache"
import { getDb } from "@taiyomoe/db"
import { env as dbEnv } from "@taiyomoe/db/env"
import { getS3Client } from "@taiyomoe/s3"
import { getMeiliClient, SEARCH_INDEXES } from "@taiyomoe/search"
import type { Hono } from "hono"
import { execSync } from "node:child_process"
import pg from "pg"
import { afterAll, test as baseTest, beforeAll } from "vitest"
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
let adminClient: pg.Client
const sharedS3 = getS3Client()
const sharedMeili = getMeiliClient()
const adminQuery = (sql: string) => adminClient.query(sql)

beforeAll(async () => {
  adminClient = new pg.Client({ connectionString: getDbUrl("postgres") })

  await adminClient.connect()
  await adminQuery(`DROP DATABASE IF EXISTS "${TEMPLATE_DB}"`)
  await adminQuery(`CREATE DATABASE "${TEMPLATE_DB}"`)

  const childEnv = { ...process.env, DATABASE_URL: getDbUrl(TEMPLATE_DB) }

  execSync("pnpm -F db kysely migrate latest", { stdio: "pipe", env: childEnv })
  execSync("pnpm -F db kysely seed run", { stdio: "pipe", env: childEnv })
})

afterAll(async () => {
  await adminQuery(`DROP DATABASE IF EXISTS "${TEMPLATE_DB}"`)
  await adminClient.end()
  await cacheClient.clear()
})

type Fixtures = {
  services: Services
  app: Hono
}

export const test = baseTest.extend<Fixtures>({
  services: async ({ task }, use) => {
    const dbName = getDbName(task.id)
    const bucketName = getBucketName(task.id)

    await adminQuery(`DROP DATABASE IF EXISTS "${dbName}"`)
    await adminQuery(`CREATE DATABASE "${dbName}" WITH TEMPLATE "${TEMPLATE_DB}"`)

    const db = getDb(getDbUrl(dbName))

    await sharedS3.send(new CreateBucketCommand({ Bucket: bucketName }))

    await Promise.all([
      sharedMeili.index(SEARCH_INDEXES.MEDIAS).deleteAllDocuments(),
      cacheClient.clear(),
    ])

    const services: Services = {
      db,
      s3: sharedS3,
      s3Bucket: bucketName,
      meili: sharedMeili,
      auth: createAuth({ db }),
    }

    await use(services)

    await db.destroy()
    await adminQuery(`DROP DATABASE IF EXISTS "${dbName}"`)

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
  },
  app: async ({ services }, use) => {
    await use(createApp(services))
  },
})
