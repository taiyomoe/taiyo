import { describe, expect, it, vi } from "vitest"
import {
  ACCOUNT_MAINTENANCE_QUEUE,
  CHAPTER_MAINTENANCE_QUEUE,
  CLOSE_RANKING_PERIODS_JOB,
  COMMENT_MAINTENANCE_QUEUE,
  DRAIN_JOB,
  DRAIN_NOTIFICATIONS_JOB,
  EXPIRE_DATA_EXPORTS_JOB,
  FAIL_STALE_SYNCS_JOB,
  MAINTENANCE_JOBS,
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
  UnknownJobError,
} from "../jobs"

describe("routeJobs", () => {
  const setup = () => {
    const handlers = {
      [REAP_JOB]: vi.fn<() => Promise<void>>(() => Promise.resolve()),
      [PUBLISH_JOB]: vi.fn<() => Promise<void>>(() => Promise.resolve()),
      [FAIL_STALE_SYNCS_JOB]: vi.fn<() => Promise<void>>(() => Promise.resolve()),
    }

    return { handlers, process: routeJobs(CHAPTER_MAINTENANCE_QUEUE, handlers) }
  }

  it("runs the handler named after the job and no other", async () => {
    const { handlers, process } = setup()

    await process({ name: FAIL_STALE_SYNCS_JOB })

    expect(handlers[FAIL_STALE_SYNCS_JOB]).toHaveBeenCalledTimes(1)
    expect(handlers[REAP_JOB]).not.toHaveBeenCalled()
    expect(handlers[PUBLISH_JOB]).not.toHaveBeenCalled()
  })

  it("rejects an unknown job name without running any handler", async () => {
    const { handlers, process } = setup()

    await expect(process({ name: "reap-stale-upload" })).rejects.toThrow(UnknownJobError)
    await expect(process({ name: "constructor" })).rejects.toThrow(UnknownJobError)

    for (const handler of Object.values(handlers)) {
      expect(handler).not.toHaveBeenCalled()
    }
  })

  it("propagates the failure of a handler", async () => {
    const process = routeJobs(SEARCH_MAINTENANCE_QUEUE, {
      [DRAIN_JOB]: () => Promise.reject(new Error("meili is down")),
    })

    await expect(process({ name: DRAIN_JOB })).rejects.toThrow("meili is down")
  })
})

describe("SCHEDULES", () => {
  it("only schedules jobs listed for their queue", () => {
    for (const { queue, job } of SCHEDULES) {
      expect(MAINTENANCE_JOBS[queue]).toContain(job)
    }
  })

  it("schedules every job exactly once", () => {
    const scheduled = SCHEDULES.map(({ queue, job }) => `${queue}/${job}`).sort()
    const declared: string[] = []

    for (const [queue, jobs] of Object.entries(MAINTENANCE_JOBS)) {
      for (const job of jobs) {
        declared.push(`${queue}/${job}`)
      }
    }

    expect(scheduled).toEqual(declared.sort())
  })

  it("keeps the cadence of every job", () => {
    expect(SCHEDULES).toEqual([
      { queue: CHAPTER_MAINTENANCE_QUEUE, job: REAP_JOB, repeat: { pattern: "0 * * * *" } },
      { queue: CHAPTER_MAINTENANCE_QUEUE, job: PUBLISH_JOB, repeat: { every: 60_000 } },
      { queue: CHAPTER_MAINTENANCE_QUEUE, job: FAIL_STALE_SYNCS_JOB, repeat: { every: 900_000 } },
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
      {
        queue: RANKING_MAINTENANCE_QUEUE,
        job: CLOSE_RANKING_PERIODS_JOB,
        repeat: { every: 600_000 },
      },
      {
        queue: ACCOUNT_MAINTENANCE_QUEUE,
        job: EXPIRE_DATA_EXPORTS_JOB,
        repeat: { every: 900_000 },
      },
    ])
  })
})
