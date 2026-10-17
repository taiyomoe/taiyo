import { chapterAudit, chapterUploadAudit, createAuditLogDrain, systemActor } from "@taiyomoe/audit"
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
import { audit, auditRedactPreset, initLogger } from "evlog"
import { env } from "./env"

const CHAPTER_MAINTENANCE_QUEUE = "chapter-maintenance"
const REAP_JOB = "reap-stale-uploads"
const PUBLISH_JOB = "publish-scheduled-chapters"
const SEARCH_MAINTENANCE_QUEUE = "search-maintenance"
const DRAIN_JOB = "drain-search-outbox"
const chapterUploadActor = systemActor("chapter-upload-worker")
const maintenanceActor = systemActor("chapter-maintenance-worker")
const deps = { db: getDb(), s3: getS3Client(), s3Bucket: getS3Bucket() }
const searchDeps = { db: deps.db, meili: getMeiliClient(), mediasIndex: SEARCH_INDEXES.MEDIAS }

initLogger({
  env: { service: "worker" },
  drain: createAuditLogDrain(deps.db),
  redact: { ...auditRedactPreset, builtins: false },
})

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
  async (job) => {
    try {
      const processed = await processChapterUpload(deps, job.data)

      if (processed !== undefined) {
        audit(
          chapterUploadAudit.PROCESS({
            actor: chapterUploadActor,
            target: { id: job.data.taskId, ...processed },
            outcome: "success",
          }),
        )
      }
    } catch (err) {
      audit(
        chapterUploadAudit.PROCESS({
          actor: chapterUploadActor,
          target: { id: job.data.taskId },
          outcome: "failure",
          reason: err instanceof Error ? err.message : String(err),
        }),
      )

      throw err
    }
  },
  { connection: createBullConnection(), concurrency: env.CHAPTER_PROCESSING_CONCURRENCY },
)
const maintenanceWorker = new Worker(
  CHAPTER_MAINTENANCE_QUEUE,
  async (job) => {
    if (job.name === PUBLISH_JOB) {
      const { chapters } = await publishScheduledChapters(deps)

      for (const { id, mediaId } of chapters) {
        audit(
          chapterAudit.PUBLISH({
            actor: maintenanceActor,
            target: { id, mediaId },
            outcome: "success",
          }),
        )
      }

      return
    }

    const { abandonedChapters, tasks } = await reapStaleChapterUploads(deps)

    for (const { id, mediaId } of abandonedChapters) {
      audit(
        chapterUploadAudit.ABANDON({
          actor: maintenanceActor,
          target: { id, mediaId },
          outcome: "success",
          reason: "PAGES_MISSING",
        }),
      )
    }

    for (const { id, ...task } of tasks) {
      audit(
        chapterUploadAudit.REAP({
          actor: maintenanceActor,
          target: { id, ...task },
          outcome: "success",
        }),
      )
    }
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
