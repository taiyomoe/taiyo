import { createBullConnection } from "@taiyomoe/queue"
import { drainSearchOutbox, type DrainSearchOutboxDeps } from "@taiyomoe/search"
import { Queue, Worker } from "bullmq"

const SEARCH_MAINTENANCE_QUEUE = "search-maintenance"
const DRAIN_JOB = "drain-search-outbox"

export const scheduleSearchMaintenance = async () => {
  const queue = new Queue(SEARCH_MAINTENANCE_QUEUE, { connection: createBullConnection() })

  await queue.upsertJobScheduler(DRAIN_JOB, { every: 60_000 }, { name: DRAIN_JOB })
  await queue.close()
}

export const startSearchMaintenanceWorker = (deps: DrainSearchOutboxDeps) =>
  new Worker(
    SEARCH_MAINTENANCE_QUEUE,
    async () => {
      await drainSearchOutbox(deps, { limit: Number.POSITIVE_INFINITY })
    },
    { connection: createBullConnection(), concurrency: 1 },
  )
