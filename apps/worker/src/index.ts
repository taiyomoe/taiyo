import {
  chapterAudit,
  chapterUploadAudit,
  commentImageAudit,
  createAuditLogDrain,
  mangaDexSyncAudit,
  rankingAudit,
  systemActor,
  userExportAudit,
} from "@taiyomoe/audit"
import { createNotificationEvents } from "@taiyomoe/cache/notification-events"
import { config } from "@taiyomoe/config"
import { getDb } from "@taiyomoe/db"
import { sendDataExportReadyEmail } from "@taiyomoe/emails"
import { createMangaDexClient } from "@taiyomoe/mangadex"
import {
  buildDataExport,
  CHAPTER_UPLOAD_QUEUE,
  type ChapterUploadJobData,
  closeRankingPeriods,
  createBullConnection,
  createWebPushSender,
  DATA_EXPORT_QUEUE,
  type DataExportJobData,
  drainNotificationOutbox,
  expireDataExports,
  failDataExport,
  failStaleMangaDexSyncs,
  MANGADEX_SYNC_QUEUE,
  type MangaDexSyncJobData,
  processChapterUpload,
  publishScheduledChapters,
  purgeNotifications,
  reapOrphanCommentImages,
  reapStaleChapterUploads,
  runMangaDexSync,
  sendPendingPushes,
} from "@taiyomoe/queue"
import {
  getS3Bucket,
  getS3Client,
  getS3PrivateBucket,
  PutBucketLifecycleConfigurationCommand,
} from "@taiyomoe/s3"
import { drainSearchOutbox, getMeiliClient, SEARCH_INDEXES } from "@taiyomoe/search"
import { Queue, Worker } from "bullmq"
import { audit, auditRedactPreset, initLogger, log } from "evlog"
import { createHyperDXDrain } from "evlog/hyperdx"
import { env } from "./env"
import {
  ACCOUNT_MAINTENANCE_QUEUE,
  CHAPTER_MAINTENANCE_QUEUE,
  CLOSE_RANKING_PERIODS_JOB,
  COMMENT_MAINTENANCE_QUEUE,
  DRAIN_JOB,
  DRAIN_NOTIFICATIONS_JOB,
  EXPIRE_DATA_EXPORTS_JOB,
  FAIL_STALE_SYNCS_JOB,
  NOTIFICATION_MAINTENANCE_QUEUE,
  PUBLISH_JOB,
  PURGE_NOTIFICATIONS_JOB,
  RANKING_MAINTENANCE_QUEUE,
  REAP_COMMENT_IMAGES_JOB,
  REAP_JOB,
  routeJobs,
  SCHEDULES,
  SEARCH_MAINTENANCE_QUEUE,
  SEND_PUSHES_JOB,
} from "./jobs"

const chapterUploadActor = systemActor("chapter-upload-worker")
const maintenanceActor = systemActor("chapter-maintenance-worker")
const commentMaintenanceActor = systemActor("comment-maintenance-worker")
const mangaDexSyncActor = systemActor("mangadex-sync-worker")
const rankingActor = systemActor("ranking-worker")
const dataExportActor = systemActor("data-export-worker")
const logConnectionErrors = (
  name: string,
  emitter: { on: (event: "error", listener: (err: Error) => void) => unknown },
) => {
  emitter.on("error", (err) => {
    log.error("bullmq", `${name}: ${err.message}`)
  })
}
const deps = { db: getDb(), s3: getS3Client(), s3Bucket: getS3Bucket() }
const mangaDexDeps = { ...deps, mangaDex: createMangaDexClient() }
const dataExportDeps = { ...deps, s3PrivateBucket: getS3PrivateBucket() }
const mangaDexSyncQueue = new Queue(MANGADEX_SYNC_QUEUE, { connection: createBullConnection() })
const notificationEvents = createNotificationEvents()
const pushDeps = { db: deps.db, send: createWebPushSender() }
const searchDeps = { db: deps.db, meili: getMeiliClient(), mediasIndex: SEARCH_INDEXES.MEDIAS }
const auditLogDrain = createAuditLogDrain(deps.db)
const hyperdxDrain =
  (process.env.TEST ?? "") !== "" ||
  env.HYPERDX_ENDPOINT === undefined ||
  env.HYPERDX_INGESTION_KEY === undefined
    ? null
    : createHyperDXDrain({ endpoint: env.HYPERDX_ENDPOINT, apiKey: env.HYPERDX_INGESTION_KEY })

// initLogger takes a single drain: audit events go to Postgres, every event to HyperDX.
initLogger({
  env: { service: "worker" },
  drain: async (ctx) => {
    await Promise.all([auditLogDrain(ctx), hyperdxDrain?.(ctx)])
  },
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
      const processed = await processChapterUpload(deps, job.data, {
        isFinalAttempt: job.attemptsMade + 1 >= (job.opts.attempts ?? 1),
      })

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
// One sync at a time keeps the worker within MangaDex's rate limits.
const mangaDexSyncWorker = new Worker<MangaDexSyncJobData>(
  MANGADEX_SYNC_QUEUE,
  async (job) => {
    try {
      const processed = await runMangaDexSync(mangaDexDeps, job.data, {
        isFinalAttempt: job.attemptsMade + 1 >= (job.opts.attempts ?? 1),
      })

      if (processed !== undefined) {
        audit(
          mangaDexSyncAudit.PROCESS({
            actor: mangaDexSyncActor,
            target: { id: job.data.syncId, ...processed },
            outcome: processed.status === "FAILED" ? "failure" : "success",
          }),
        )
      }
    } catch (err) {
      audit(
        mangaDexSyncAudit.PROCESS({
          actor: mangaDexSyncActor,
          target: { id: job.data.syncId },
          outcome: "failure",
          reason: err instanceof Error ? err.message : String(err),
        }),
      )

      throw err
    }
  },
  { connection: createBullConnection(), concurrency: 1 },
)
// One archive at a time bounds the memory and the database snapshot an export holds.
const dataExportWorker = new Worker<DataExportJobData>(
  DATA_EXPORT_QUEUE,
  async (job) => {
    const { exportId, settingsUrl } = job.data

    try {
      const ready = await buildDataExport(dataExportDeps, job.data)

      if (ready === undefined) {
        return
      }

      audit(
        userExportAudit.BUILD({
          actor: dataExportActor,
          target: { id: exportId, userId: ready.userId, byteSize: ready.byteSize },
          outcome: "success",
        }),
      )
      await notificationEvents.publish([ready.userId])

      if (ready.email !== null && ready.email !== "") {
        await sendDataExportReadyEmail({
          to: ready.email,
          name: ready.name,
          expiresInDays: config.dataExports.expiryDays,
          url: settingsUrl,
        }).catch((err: unknown) => {
          log.error("data-export", `email for ${exportId} not sent: ${String(err)}`)
        })
      }
    } catch (err) {
      const isFinalAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1)

      if (isFinalAttempt) {
        await failDataExport(deps, exportId)
      }

      audit(
        userExportAudit.BUILD({
          actor: dataExportActor,
          target: { id: exportId },
          outcome: "failure",
          reason: err instanceof Error ? err.message : String(err),
        }),
      )

      throw err
    }
  },
  { connection: createBullConnection(), concurrency: 1 },
)
const accountWorker = new Worker(
  ACCOUNT_MAINTENANCE_QUEUE,
  routeJobs(ACCOUNT_MAINTENANCE_QUEUE, {
    [EXPIRE_DATA_EXPORTS_JOB]: async () => {
      const { expired, failed } = await expireDataExports(dataExportDeps)

      for (const { id, userId } of expired) {
        audit(
          userExportAudit.EXPIRE({
            actor: dataExportActor,
            target: { id, userId },
            outcome: "success",
          }),
        )
      }

      for (const { id, userId } of failed) {
        audit(
          userExportAudit.BUILD({
            actor: dataExportActor,
            target: { id, userId },
            outcome: "failure",
            reason: `still pending after ${config.dataExports.staleAfterHours} hours`,
          }),
        )
      }
    },
  }),
  { connection: createBullConnection(), concurrency: 1 },
)
const maintenanceWorker = new Worker(
  CHAPTER_MAINTENANCE_QUEUE,
  routeJobs(CHAPTER_MAINTENANCE_QUEUE, {
    [PUBLISH_JOB]: async () => {
      const { chapters, awardedUserIds } = await publishScheduledChapters(deps)

      await notificationEvents.publish(awardedUserIds)

      for (const { id, mediaId } of chapters) {
        audit(
          chapterAudit.PUBLISH({
            actor: maintenanceActor,
            target: { id, mediaId },
            outcome: "success",
          }),
        )
      }
    },
    [FAIL_STALE_SYNCS_JOB]: async () => {
      const failed = await failStaleMangaDexSyncs({
        ...mangaDexDeps,
        getJobState: (syncId) => mangaDexSyncQueue.getJobState(syncId),
      })

      for (const { id, mediaId, jobState } of failed) {
        audit(
          mangaDexSyncAudit.PROCESS({
            actor: mangaDexSyncActor,
            target: { id, mediaId },
            outcome: "failure",
            reason: `STALLED (job ${jobState})`,
          }),
        )
      }
    },
    [REAP_JOB]: async () => {
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
  }),
  { connection: createBullConnection(), concurrency: 1 },
)
const searchWorker = new Worker(
  SEARCH_MAINTENANCE_QUEUE,
  routeJobs(SEARCH_MAINTENANCE_QUEUE, {
    [DRAIN_JOB]: async () => {
      await drainSearchOutbox(searchDeps, { limit: Number.POSITIVE_INFINITY })
    },
  }),
  { connection: createBullConnection(), concurrency: 1 },
)
const commentWorker = new Worker(
  COMMENT_MAINTENANCE_QUEUE,
  routeJobs(COMMENT_MAINTENANCE_QUEUE, {
    [REAP_COMMENT_IMAGES_JOB]: async () => {
      const reaped = await reapOrphanCommentImages(deps)

      for (const { id, uploaderId } of reaped) {
        audit(
          commentImageAudit.REAP({
            actor: commentMaintenanceActor,
            target: { id, uploaderId },
            outcome: "success",
          }),
        )
      }
    },
  }),
  { connection: createBullConnection(), concurrency: 1 },
)
const notificationWorker = new Worker(
  NOTIFICATION_MAINTENANCE_QUEUE,
  routeJobs(NOTIFICATION_MAINTENANCE_QUEUE, {
    [PURGE_NOTIFICATIONS_JOB]: async () => {
      await purgeNotifications(deps)
    },
    [DRAIN_NOTIFICATIONS_JOB]: async () => {
      const { userIds } = await drainNotificationOutbox(deps)

      await notificationEvents.publish(userIds)
      await sendPendingPushes(pushDeps)
    },
    [SEND_PUSHES_JOB]: async () => {
      await sendPendingPushes(pushDeps)
    },
  }),
  { connection: createBullConnection(), concurrency: 1 },
)
const rankingWorker = new Worker(
  RANKING_MAINTENANCE_QUEUE,
  routeJobs(RANKING_MAINTENANCE_QUEUE, {
    [CLOSE_RANKING_PERIODS_JOB]: async () => {
      const closed = await closeRankingPeriods(deps)

      for (const { id, kind, startsAt, endsAt, results, points, achievements } of closed) {
        audit(
          rankingAudit.PERIOD_CLOSE({
            actor: rankingActor,
            target: { id, kind, startsAt, endsAt, results, points, achievements },
            outcome: "success",
          }),
        )
      }

      await notificationEvents.publish([...new Set(closed.flatMap(({ userIds }) => userIds))])
    },
  }),
  { connection: createBullConnection(), concurrency: 1 },
)

logConnectionErrors(MANGADEX_SYNC_QUEUE, mangaDexSyncQueue)
logConnectionErrors(CHAPTER_UPLOAD_QUEUE, chapterWorker)
logConnectionErrors(MANGADEX_SYNC_QUEUE, mangaDexSyncWorker)
logConnectionErrors(CHAPTER_MAINTENANCE_QUEUE, maintenanceWorker)
logConnectionErrors(SEARCH_MAINTENANCE_QUEUE, searchWorker)
logConnectionErrors(COMMENT_MAINTENANCE_QUEUE, commentWorker)
logConnectionErrors(NOTIFICATION_MAINTENANCE_QUEUE, notificationWorker)
logConnectionErrors(RANKING_MAINTENANCE_QUEUE, rankingWorker)
logConnectionErrors(DATA_EXPORT_QUEUE, dataExportWorker)
logConnectionErrors(ACCOUNT_MAINTENANCE_QUEUE, accountWorker)

chapterWorker.on("ready", () => {
  // oxlint-disable-next-line no-console
  console.debug("chapter-upload worker ready")
})

for (const queueName of new Set(SCHEDULES.map(({ queue }) => queue))) {
  const queue = new Queue(queueName, { connection: createBullConnection() })

  logConnectionErrors(queueName, queue)

  try {
    for (const { queue: scheduleQueue, job, repeat } of SCHEDULES) {
      if (scheduleQueue === queueName) {
        await queue.upsertJobScheduler(job, repeat, { name: job })
      }
    }

    await queue.close()
  } catch (err) {
    // oxlint-disable-next-line no-console
    console.warn(`${queueName} schedule not applied (store may not support it):`, err)
  }
}

const handleShutdownSignal = () => {
  Promise.all([
    chapterWorker.close(),
    mangaDexSyncWorker.close(),
    maintenanceWorker.close(),
    searchWorker.close(),
    commentWorker.close(),
    notificationWorker.close(),
    rankingWorker.close(),
    dataExportWorker.close(),
    accountWorker.close(),
    mangaDexSyncQueue.close(),
  ])
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
