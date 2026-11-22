import {
  chapterAudit,
  chapterUploadAudit,
  commentImageAudit,
  createAuditLogDrain,
  mangaDexSyncAudit,
  rankingAudit,
  systemActor,
} from "@taiyomoe/audit"
import { createNotificationEvents } from "@taiyomoe/cache/notification-events"
import { config } from "@taiyomoe/config"
import { getDb } from "@taiyomoe/db"
import { createMangaDexClient } from "@taiyomoe/mangadex"
import {
  CHAPTER_UPLOAD_QUEUE,
  type ChapterUploadJobData,
  closeRankingPeriods,
  createBullConnection,
  createWebPushSender,
  drainNotificationOutbox,
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
import { getS3Bucket, getS3Client, PutBucketLifecycleConfigurationCommand } from "@taiyomoe/s3"
import { drainSearchOutbox, getMeiliClient, SEARCH_INDEXES } from "@taiyomoe/search"
import { Queue, Worker } from "bullmq"
import { audit, auditRedactPreset, initLogger, log } from "evlog"
import { createHyperDXDrain } from "evlog/hyperdx"
import { env } from "./env"

const CHAPTER_MAINTENANCE_QUEUE = "chapter-maintenance"
const REAP_JOB = "reap-stale-uploads"
const PUBLISH_JOB = "publish-scheduled-chapters"
const FAIL_STALE_SYNCS_JOB = "fail-stale-mangadex-syncs"
const SEARCH_MAINTENANCE_QUEUE = "search-maintenance"
const DRAIN_JOB = "drain-search-outbox"
const COMMENT_MAINTENANCE_QUEUE = "comment-maintenance"
const REAP_COMMENT_IMAGES_JOB = "reap-orphan-comment-images"
const NOTIFICATION_MAINTENANCE_QUEUE = "notification-maintenance"
const DRAIN_NOTIFICATIONS_JOB = "drain-notification-outbox"
const PURGE_NOTIFICATIONS_JOB = "purge-notifications"
const SEND_PUSHES_JOB = "send-pushes"
const RANKING_MAINTENANCE_QUEUE = "ranking-maintenance"
const CLOSE_RANKING_PERIODS_JOB = "close-ranking-periods"
const chapterUploadActor = systemActor("chapter-upload-worker")
const maintenanceActor = systemActor("chapter-maintenance-worker")
const commentMaintenanceActor = systemActor("comment-maintenance-worker")
const mangaDexSyncActor = systemActor("mangadex-sync-worker")
const rankingActor = systemActor("ranking-worker")
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
const maintenanceWorker = new Worker(
  CHAPTER_MAINTENANCE_QUEUE,
  async (job) => {
    if (job.name === PUBLISH_JOB) {
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

      return
    }

    if (job.name === FAIL_STALE_SYNCS_JOB) {
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
const commentWorker = new Worker(
  COMMENT_MAINTENANCE_QUEUE,
  async () => {
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
  { connection: createBullConnection(), concurrency: 1 },
)
const notificationWorker = new Worker(
  NOTIFICATION_MAINTENANCE_QUEUE,
  async (job) => {
    if (job.name === PURGE_NOTIFICATIONS_JOB) {
      await purgeNotifications(deps)

      return
    }

    if (job.name === DRAIN_NOTIFICATIONS_JOB) {
      const { userIds } = await drainNotificationOutbox(deps)

      await notificationEvents.publish(userIds)
    }

    await sendPendingPushes(pushDeps)
  },
  { connection: createBullConnection(), concurrency: 1 },
)
const rankingWorker = new Worker(
  RANKING_MAINTENANCE_QUEUE,
  async () => {
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

chapterWorker.on("ready", () => {
  // oxlint-disable-next-line no-console
  console.debug("chapter-upload worker ready")
})

const chapterMaintenanceQueue = new Queue(CHAPTER_MAINTENANCE_QUEUE, {
  connection: createBullConnection(),
})

logConnectionErrors(CHAPTER_MAINTENANCE_QUEUE, chapterMaintenanceQueue)

await chapterMaintenanceQueue
  .upsertJobScheduler(REAP_JOB, { pattern: "0 * * * *" }, { name: REAP_JOB })
  .then(() =>
    chapterMaintenanceQueue.upsertJobScheduler(
      PUBLISH_JOB,
      { every: 60_000 },
      { name: PUBLISH_JOB },
    ),
  )
  .then(() =>
    chapterMaintenanceQueue.upsertJobScheduler(
      FAIL_STALE_SYNCS_JOB,
      { every: 15 * 60_000 },
      { name: FAIL_STALE_SYNCS_JOB },
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

logConnectionErrors(SEARCH_MAINTENANCE_QUEUE, searchMaintenanceQueue)

await searchMaintenanceQueue
  .upsertJobScheduler(DRAIN_JOB, { every: 60_000 }, { name: DRAIN_JOB })
  .then(() => searchMaintenanceQueue.close())
  .catch((err: unknown) => {
    // oxlint-disable-next-line no-console
    console.warn("search maintenance schedule not applied (store may not support it):", err)
  })

const commentMaintenanceQueue = new Queue(COMMENT_MAINTENANCE_QUEUE, {
  connection: createBullConnection(),
})

logConnectionErrors(COMMENT_MAINTENANCE_QUEUE, commentMaintenanceQueue)

await commentMaintenanceQueue
  .upsertJobScheduler(
    REAP_COMMENT_IMAGES_JOB,
    { pattern: "30 * * * *" },
    { name: REAP_COMMENT_IMAGES_JOB },
  )
  .then(() => commentMaintenanceQueue.close())
  .catch((err: unknown) => {
    // oxlint-disable-next-line no-console
    console.warn("comment maintenance schedule not applied (store may not support it):", err)
  })

const notificationMaintenanceQueue = new Queue(NOTIFICATION_MAINTENANCE_QUEUE, {
  connection: createBullConnection(),
})

logConnectionErrors(NOTIFICATION_MAINTENANCE_QUEUE, notificationMaintenanceQueue)

await notificationMaintenanceQueue
  .upsertJobScheduler(DRAIN_NOTIFICATIONS_JOB, { every: 10_000 }, { name: DRAIN_NOTIFICATIONS_JOB })
  .then(() =>
    notificationMaintenanceQueue.upsertJobScheduler(
      SEND_PUSHES_JOB,
      { every: 5000 },
      { name: SEND_PUSHES_JOB },
    ),
  )
  .then(() =>
    notificationMaintenanceQueue.upsertJobScheduler(
      PURGE_NOTIFICATIONS_JOB,
      { pattern: "15 4 * * *" },
      { name: PURGE_NOTIFICATIONS_JOB },
    ),
  )
  .then(() => notificationMaintenanceQueue.close())
  .catch((err: unknown) => {
    // oxlint-disable-next-line no-console
    console.warn("notification maintenance schedule not applied (store may not support it):", err)
  })

const rankingMaintenanceQueue = new Queue(RANKING_MAINTENANCE_QUEUE, {
  connection: createBullConnection(),
})

logConnectionErrors(RANKING_MAINTENANCE_QUEUE, rankingMaintenanceQueue)

// Periods end at UTC midnight: a short repeat closes them soon after, and catches up after downtime.
await rankingMaintenanceQueue
  .upsertJobScheduler(
    CLOSE_RANKING_PERIODS_JOB,
    { every: 10 * 60_000 },
    { name: CLOSE_RANKING_PERIODS_JOB },
  )
  .then(() => rankingMaintenanceQueue.close())
  .catch((err: unknown) => {
    process.stderr.write(`ranking maintenance schedule not applied: ${String(err)}\n`)
  })

const handleShutdownSignal = () => {
  Promise.all([
    chapterWorker.close(),
    mangaDexSyncWorker.close(),
    maintenanceWorker.close(),
    searchWorker.close(),
    commentWorker.close(),
    notificationWorker.close(),
    rankingWorker.close(),
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
