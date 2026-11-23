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
const ACCOUNT_MAINTENANCE_QUEUE = "account-maintenance"
const EXPIRE_DATA_EXPORTS_JOB = "expire-data-exports"

export {
  CHAPTER_MAINTENANCE_QUEUE,
  REAP_JOB,
  PUBLISH_JOB,
  FAIL_STALE_SYNCS_JOB,
  SEARCH_MAINTENANCE_QUEUE,
  DRAIN_JOB,
  COMMENT_MAINTENANCE_QUEUE,
  REAP_COMMENT_IMAGES_JOB,
  NOTIFICATION_MAINTENANCE_QUEUE,
  DRAIN_NOTIFICATIONS_JOB,
  PURGE_NOTIFICATIONS_JOB,
  SEND_PUSHES_JOB,
  RANKING_MAINTENANCE_QUEUE,
  CLOSE_RANKING_PERIODS_JOB,
  ACCOUNT_MAINTENANCE_QUEUE,
  EXPIRE_DATA_EXPORTS_JOB,
}

/** @internal Exported for its tests. */
export const MAINTENANCE_JOBS = {
  [CHAPTER_MAINTENANCE_QUEUE]: [REAP_JOB, PUBLISH_JOB, FAIL_STALE_SYNCS_JOB],
  [SEARCH_MAINTENANCE_QUEUE]: [DRAIN_JOB],
  [COMMENT_MAINTENANCE_QUEUE]: [REAP_COMMENT_IMAGES_JOB],
  [NOTIFICATION_MAINTENANCE_QUEUE]: [
    DRAIN_NOTIFICATIONS_JOB,
    SEND_PUSHES_JOB,
    PURGE_NOTIFICATIONS_JOB,
  ],
  [RANKING_MAINTENANCE_QUEUE]: [CLOSE_RANKING_PERIODS_JOB],
  [ACCOUNT_MAINTENANCE_QUEUE]: [EXPIRE_DATA_EXPORTS_JOB],
} as const

export type MaintenanceQueue = keyof typeof MAINTENANCE_JOBS

export type JobName<Q extends MaintenanceQueue> = (typeof MAINTENANCE_JOBS)[Q][number]

type Schedule = {
  queue: MaintenanceQueue
  job: JobName<MaintenanceQueue>
  repeat: { pattern: string } | { every: number }
}

export const SCHEDULES: readonly Schedule[] = [
  { queue: CHAPTER_MAINTENANCE_QUEUE, job: REAP_JOB, repeat: { pattern: "0 * * * *" } },
  { queue: CHAPTER_MAINTENANCE_QUEUE, job: PUBLISH_JOB, repeat: { every: 60_000 } },
  { queue: CHAPTER_MAINTENANCE_QUEUE, job: FAIL_STALE_SYNCS_JOB, repeat: { every: 15 * 60_000 } },
  { queue: SEARCH_MAINTENANCE_QUEUE, job: DRAIN_JOB, repeat: { every: 60_000 } },
  {
    queue: COMMENT_MAINTENANCE_QUEUE,
    job: REAP_COMMENT_IMAGES_JOB,
    repeat: { pattern: "30 * * * *" },
  },
  {
    queue: NOTIFICATION_MAINTENANCE_QUEUE,
    job: DRAIN_NOTIFICATIONS_JOB,
    repeat: { every: 10_000 },
  },
  { queue: NOTIFICATION_MAINTENANCE_QUEUE, job: SEND_PUSHES_JOB, repeat: { every: 5000 } },
  {
    queue: NOTIFICATION_MAINTENANCE_QUEUE,
    job: PURGE_NOTIFICATIONS_JOB,
    repeat: { pattern: "15 4 * * *" },
  },
  // Periods end at UTC midnight: a short repeat closes them soon after, and catches up after downtime.
  {
    queue: RANKING_MAINTENANCE_QUEUE,
    job: CLOSE_RANKING_PERIODS_JOB,
    repeat: { every: 10 * 60_000 },
  },
  {
    queue: ACCOUNT_MAINTENANCE_QUEUE,
    job: EXPIRE_DATA_EXPORTS_JOB,
    repeat: { every: 15 * 60_000 },
  },
]

/** @internal Exported for its tests. */
export class UnknownJobError extends Error {}

export const routeJobs = <Q extends MaintenanceQueue>(
  queue: Q,
  handlers: Record<JobName<Q>, () => Promise<void>>,
) => {
  const byName = new Map<string, () => Promise<void>>(Object.entries(handlers))

  return async (job: { name: string }) => {
    const handler = byName.get(job.name)

    if (handler === undefined) {
      throw new UnknownJobError(`${queue} has no handler for job "${job.name}"`)
    }

    await handler()
  }
}
