import { config } from "@taiyomoe/config"
import { getDb } from "@taiyomoe/db"
import {
  CHAPTER_UPLOAD_QUEUE,
  type ChapterUploadJobData,
  createBullConnection,
  processChapterUpload,
  publishScheduledChapters,
  reapStaleChapterUploads,
} from "@taiyomoe/queue"
import { getS3Bucket, getS3Client, PutBucketLifecycleConfigurationCommand } from "@taiyomoe/s3"
import { drainSearchOutbox, getMeiliClient, SEARCH_INDEXES } from "@taiyomoe/search"
import { Queue, Worker } from "bullmq"
import { env } from "./env"

const CHAPTER_MAINTENANCE_QUEUE = "chapter-maintenance"
const REAP_JOB = "reap-stale-uploads"
const PUBLISH_JOB = "publish-scheduled-chapters"
const SEARCH_MAINTENANCE_QUEUE = "search-maintenance"
const DRAIN_JOB = "drain-search-outbox"
const deps = { db: getDb(), s3: getS3Client(), s3Bucket: getS3Bucket() }
const searchDeps = { db: deps.db, meili: getMeiliClient(), mediasIndex: SEARCH_INDEXES.MEDIAS }

await deps.s3
  .send(
    new PutBucketLifecycleConfigurationCommand({
      Bucket: deps.s3Bucket,
      LifecycleConfiguration: {
        Rules: [
          {
            ID: "expire-staging",
            Status: "Enabled",
            Filter: { Prefix: "staging/" },
            Expiration: { Days: config.images.stagingExpiryDays },
          },
        ],
      },
    }),
  )
  .catch((err: unknown) => {
    // oxlint-disable-next-line no-console
    console.warn("staging lifecycle rule not applied (store may not support it):", err)
  })

const chapterWorker = new Worker<ChapterUploadJobData>(
  CHAPTER_UPLOAD_QUEUE,
  async (job) => processChapterUpload(deps, job.data),
  { connection: createBullConnection(), concurrency: env.CHAPTER_PROCESSING_CONCURRENCY },
)
const maintenanceWorker = new Worker(
  CHAPTER_MAINTENANCE_QUEUE,
  async (job) => {
    if (job.name === PUBLISH_JOB) {
      await publishScheduledChapters(deps)

      return
    }

    await reapStaleChapterUploads(deps)
  },
  { connection: createBullConnection(), concurrency: 1 },
)
const searchWorker = new Worker(
  SEARCH_MAINTENANCE_QUEUE,
  async () => {
    await drainSearchOutbox(searchDeps, { limit: Number.POSITIVE_INFINITY })
  },
  { connection: createBullConnection(), concurrency: 1 },
)

chapterWorker.on("ready", () => {
  // oxlint-disable-next-line no-console
  console.debug("chapter-upload worker ready")
})

const chapterMaintenanceQueue = new Queue(CHAPTER_MAINTENANCE_QUEUE, {
  connection: createBullConnection(),
})

await chapterMaintenanceQueue
  .upsertJobScheduler(REAP_JOB, { pattern: "0 * * * *" }, { name: REAP_JOB })
  .then(() =>
    chapterMaintenanceQueue.upsertJobScheduler(
      PUBLISH_JOB,
      { every: 60_000 },
      { name: PUBLISH_JOB },
    ),
  )
  .then(() => chapterMaintenanceQueue.close())
  .catch((err: unknown) => {
    // oxlint-disable-next-line no-console
    console.warn("chapter maintenance schedule not applied (store may not support it):", err)
  })

const searchMaintenanceQueue = new Queue(SEARCH_MAINTENANCE_QUEUE, {
  connection: createBullConnection(),
})

await searchMaintenanceQueue
  .upsertJobScheduler(DRAIN_JOB, { every: 60_000 }, { name: DRAIN_JOB })
  .then(() => searchMaintenanceQueue.close())
  .catch((err: unknown) => {
    // oxlint-disable-next-line no-console
    console.warn("search maintenance schedule not applied (store may not support it):", err)
  })

const handleShutdownSignal = () => {
  Promise.all([chapterWorker.close(), maintenanceWorker.close(), searchWorker.close()])
    .then(() => {
      process.exit(0)
    })
    .catch((err: unknown) => {
      // oxlint-disable-next-line no-console
      console.error("worker shutdown failed:", err)
      process.exit(1)
    })
}

process.on("SIGTERM", handleShutdownSignal)
process.on("SIGINT", handleShutdownSignal)
