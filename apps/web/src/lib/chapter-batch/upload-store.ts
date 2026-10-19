import type { Language } from "@taiyomoe/db/constants"
import type { QueryClient } from "@tanstack/react-query"
import type { ChapterSource } from "@/lib/chapter-batch/sources"
import {
  createChapter,
  getUploadStatus,
  uploadPages,
  withdrawChapter,
} from "@/lib/chapter-batch/upload"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export type JobState =
  | { kind: "queued" }
  | { kind: "uploading"; done: number; total: number }
  | { kind: "processing" }
  | { kind: "done"; published: boolean }
  | { kind: "failed"; message: string }
  | { kind: "cancelled" }

export type UploadJob = {
  key: string
  number: number
  volume: string | null
  title: string | null
  source: ChapterSource
  pageKeys: string[]
  state: JobState
}

export type UploadBatch = {
  id: string
  mediaId: string
  mediaTitle: string
  language: Language
  groupIds: string[]
  jobs: UploadJob[]
}

export type NewUploadBatch = Omit<UploadBatch, "id" | "jobs"> & {
  jobs: Array<Omit<UploadJob, "state">>
}

type Processing = {
  batchId: string
  chapterId: string
  taskId: string
  published: boolean
  since: number
}

const CHAPTERS_AT_ONCE = 2
const POLL_INTERVAL_MS = 2000
const PROCESSING_TIMEOUT_MS = 20 * 60 * 1000
const EMPTY: UploadBatch[] = []
let batches: UploadBatch[] = EMPTY
let queryClient: QueryClient | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null
const listeners = new Set<() => void>()
const controllers = new Map<string, AbortController>()
const processing = new Map<string, Processing>()
const isActive = (state: JobState) => state.kind === "queued" || state.kind === "uploading"
const isBusy = (state: JobState) => isActive(state) || state.kind === "processing"
const preventUnload = (event: BeforeUnloadEvent) => {
  event.preventDefault()
}
const emit = () => {
  const active = batches.some((batch) => batch.jobs.some((job) => isActive(job.state)))

  if (active) {
    window.addEventListener("beforeunload", preventUnload)
  } else {
    window.removeEventListener("beforeunload", preventUnload)
  }

  for (const listener of listeners) {
    listener()
  }
}
const setJobState = (jobKey: string, state: JobState) => {
  batches = batches.map((batch) =>
    batch.jobs.some((job) => job.key === jobKey)
      ? {
          ...batch,
          jobs: batch.jobs.map((job) => (job.key === jobKey ? { ...job, state } : job)),
        }
      : batch,
  )
  emit()
}
const refreshQueries = (mediaId: string) => {
  void queryClient?.invalidateQueries({ queryKey: ["chapter-review"] })
  void queryClient?.invalidateQueries({ queryKey: ["chapters"] })
  void queryClient?.invalidateQueries({ queryKey: ["medias", mediaId] })
}
const poll = async () => {
  for (const [jobKey, entry] of processing) {
    const batch = batches.find((item) => item.id === entry.batchId)

    try {
      const status = await getUploadStatus(entry.chapterId, entry.taskId)

      if (status === "FINISHED") {
        processing.delete(jobKey)
        setJobState(jobKey, { kind: "done", published: entry.published })

        if (batch !== undefined) {
          refreshQueries(batch.mediaId)
        }
      } else if (status === "FAILED" || Date.now() - entry.since > PROCESSING_TIMEOUT_MS) {
        processing.delete(jobKey)
        void withdrawChapter(entry.chapterId).catch(() => undefined)
        setJobState(jobKey, { kind: "failed", message: m.upload_failed_processing() })
      }
    } catch {
      if (Date.now() - entry.since > PROCESSING_TIMEOUT_MS) {
        processing.delete(jobKey)
        setJobState(jobKey, { kind: "failed", message: m.upload_failed_processing() })
      }
    }
  }

  if (processing.size === 0 && pollTimer !== null) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}
const ensurePolling = () => {
  pollTimer ??= setInterval(() => {
    void poll()
  }, POLL_INTERVAL_MS)
}
const runJob = async (batch: UploadBatch, job: UploadJob) => {
  const controller = new AbortController()
  const total = job.pageKeys.length
  let chapterId: string | null = null

  controllers.set(job.key, controller)
  setJobState(job.key, { kind: "uploading", done: 0, total })

  try {
    const blobs = await job.source.open()
    const types = new Map(job.source.pages.map((page) => [page.key, page.type]))
    const pages = job.pageKeys.map((key) => {
      const blob = blobs.get(key)
      const type = types.get(key)

      if (blob === undefined || type === undefined) {
        throw new Error(m.upload_failed_missing_page())
      }

      return { blob, type }
    })
    const created = await createChapter(
      {
        mediaId: batch.mediaId,
        number: job.number,
        volume: job.volume,
        title: job.title,
        language: batch.language,
        groupIds: batch.groupIds,
      },
      controller.signal,
    )

    chapterId = created.id

    const taskId = await uploadPages(
      created.id,
      pages,
      (done) => {
        setJobState(job.key, { kind: "uploading", done, total })
      },
      controller.signal,
    )

    processing.set(job.key, {
      batchId: batch.id,
      chapterId: created.id,
      taskId,
      published: created.status !== "PENDING",
      since: Date.now(),
    })
    setJobState(job.key, { kind: "processing" })
    ensurePolling()
  } catch (error) {
    if (chapterId !== null) {
      void withdrawChapter(chapterId).catch(() => undefined)
    }

    setJobState(
      job.key,
      controller.signal.aborted
        ? { kind: "cancelled" }
        : { kind: "failed", message: getErrorMessage(error) },
    )
  } finally {
    controllers.delete(job.key)
    pump()
  }
}
const pump = () => {
  const running = batches.flatMap((batch) =>
    batch.jobs.filter((job) => job.state.kind === "uploading"),
  ).length
  const next = batches
    .flatMap((batch) =>
      batch.jobs.filter((job) => job.state.kind === "queued").map((job) => ({ batch, job })),
    )
    .slice(0, Math.max(CHAPTERS_AT_ONCE - running, 0))

  for (const { batch, job } of next) {
    void runJob(batch, job)
  }
}

export const uploadStore = {
  subscribe: (listener: () => void) => {
    listeners.add(listener)

    return () => {
      listeners.delete(listener)
    }
  },
  getSnapshot: () => batches,
  getServerSnapshot: () => EMPTY,
  connect: (client: QueryClient) => {
    queryClient = client
  },
  start: (batch: NewUploadBatch) => {
    batches = [
      ...batches,
      {
        ...batch,
        id: crypto.randomUUID(),
        jobs: batch.jobs.map((job) => ({ ...job, state: { kind: "queued" } })),
      },
    ]
    emit()
    pump()
  },
  cancel: (batchId: string) => {
    const batch = batches.find((item) => item.id === batchId)

    for (const job of batch?.jobs ?? []) {
      if (job.state.kind === "queued") {
        setJobState(job.key, { kind: "cancelled" })
      }

      controllers.get(job.key)?.abort()
    }
  },
  retry: (batchId: string) => {
    const batch = batches.find((item) => item.id === batchId)

    for (const job of batch?.jobs ?? []) {
      if (job.state.kind === "failed" || job.state.kind === "cancelled") {
        setJobState(job.key, { kind: "queued" })
      }
    }

    pump()
  },
  dismiss: (batchId: string) => {
    batches = batches.filter(
      (batch) => batch.id !== batchId || batch.jobs.some((job) => isBusy(job.state)),
    )
    emit()
  },
}

export const summarize = (jobs: readonly UploadJob[]) => {
  const count = (kind: JobState["kind"]) => jobs.filter((job) => job.state.kind === kind).length

  return {
    total: jobs.length,
    queued: count("queued"),
    uploading: count("uploading"),
    processing: count("processing"),
    failed: count("failed"),
    cancelled: count("cancelled"),
    published: jobs.filter((job) => job.state.kind === "done" && job.state.published).length,
    inReview: jobs.filter((job) => job.state.kind === "done" && !job.state.published).length,
    busy: jobs.some((job) => isBusy(job.state)),
  }
}

export const jobProgress = (state: JobState) => {
  if (state.kind === "uploading") {
    return state.total === 0 ? 0 : state.done / state.total
  }

  return state.kind === "queued" ? 0 : 1
}
