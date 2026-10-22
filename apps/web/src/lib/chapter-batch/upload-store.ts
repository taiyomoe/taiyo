import type { ImageMimeType, Language } from "@taiyomoe/db/constants"
import type { QueryClient } from "@tanstack/react-query"
import type { ChapterSource } from "@/lib/chapter-batch/sources"
import { api } from "@/lib/api"
import { ensureSuccess, unwrap } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export type JobOutcome = "published" | "scheduled" | "review"

export type JobState =
  | { kind: "queued" }
  | { kind: "uploading"; done: number; total: number }
  | { kind: "processing" }
  | { kind: "done"; outcome: JobOutcome }
  | { kind: "failed"; message: string }
  | { kind: "cancelled" }

export type UploadJob = {
  key: string
  number: number
  volume: string | null
  title: string | null
  source: ChapterSource | null
  pageKeys: string[]
  publishAt: string | null
  externalUrl: string | null
  state: JobState
}

type UploadBatch = {
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
  review: boolean
  publishAt: string | null
  since: number
}

const CHAPTERS_AT_ONCE = 2
const PARALLEL_UPLOADS = 4
const POLL_INTERVAL_MS = 2000
const PROCESSING_TIMEOUT_MS = 20 * 60 * 1000
const EMPTY: UploadBatch[] = []
let batches: UploadBatch[] = EMPTY
let queryClient: QueryClient | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null
const listeners = new Set<() => void>()
const controllers = new Map<string, AbortController>()
const processing = new Map<string, Processing>()
const outcomeOf = (review: boolean, publishAt: string | null): JobOutcome => {
  if (review) {
    return "review"
  }

  return publishAt !== null && new Date(publishAt).getTime() > Date.now()
    ? "scheduled"
    : "published"
}
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
const withdrawChapter = async (chapterId: string) => {
  await ensureSuccess(await api.chapters[":id"].withdraw.$post({ param: { id: chapterId } }))
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
      const response = await api.chapters[":id"].pages.status.$get({
        param: { id: entry.chapterId },
        query: { taskId: entry.taskId },
      })
      const { status } = await unwrap<Awaited<ReturnType<typeof response.json>>>(response)

      if (status === "FINISHED") {
        processing.delete(jobKey)
        setJobState(jobKey, { kind: "done", outcome: outcomeOf(entry.review, entry.publishAt) })

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
const pump = () => {
  const running = batches.flatMap((batch) =>
    batch.jobs.filter((job) => job.state.kind === "uploading"),
  ).length
  const next = batches
    .flatMap((batch) =>
      batch.jobs.filter((job) => job.state.kind === "queued").map((job) => ({ batch, job })),
    )
    .slice(0, Math.max(CHAPTERS_AT_ONCE - running, 0))

  void Promise.all(
    next.map(async ({ batch, job }) => {
      const controller = new AbortController()
      const total = job.pageKeys.length
      let chapterId: string | null = null

      controllers.set(job.key, controller)
      setJobState(job.key, { kind: "uploading", done: 0, total })

      try {
        let pages: Array<{ blob: Blob; type: ImageMimeType }> = []

        if (job.source !== null) {
          const blobs = await job.source.open()
          const types = new Map(job.source.pages.map((page) => [page.key, page.type]))

          pages = job.pageKeys.map((key) => {
            const blob = blobs.get(key)
            const type = types.get(key)

            if (blob === undefined || type === undefined) {
              throw new Error(m.upload_failed_missing_page())
            }

            return { blob, type }
          })
        }

        const createResponse = await api.medias[":id"].chapters.$post(
          {
            param: { id: batch.mediaId },
            json: {
              number: job.number,
              volume: job.volume,
              title: job.title,
              language: batch.language,
              publishAt: job.publishAt,
              externalUrl: job.externalUrl,
              isExternal: job.source === null,
              groupIds: batch.groupIds,
            },
          },
          { init: { signal: controller.signal } },
        )
        const created =
          await unwrap<Awaited<ReturnType<typeof createResponse.json>>>(createResponse)

        if (job.source === null) {
          setJobState(job.key, {
            kind: "done",
            outcome: outcomeOf(created.status === "PENDING", job.publishAt),
          })
          refreshQueries(batch.mediaId)

          return
        }

        chapterId = created.id

        const sessionResponse = await api.chapters[":id"].pages["upload-session"].$post(
          {
            param: { id: created.id },
            json: {
              pages: pages.map((page) => ({ contentType: page.type, size: page.blob.size })),
            },
          },
          { init: { signal: controller.signal } },
        )
        const session =
          await unwrap<Awaited<ReturnType<typeof sessionResponse.json>>>(sessionResponse)
        const queue = [...session.pages]
        let done = 0

        await Promise.all(
          Array.from({ length: PARALLEL_UPLOADS }, async () => {
            for (let slot = queue.shift(); slot !== undefined; slot = queue.shift()) {
              const page = pages[slot.index]

              if (page === undefined) {
                throw new Error("Missing page")
              }

              const response = await fetch(slot.uploadUrl, {
                method: "PUT",
                body: page.blob,
                headers: { "content-type": page.type },
                signal: controller.signal,
              })

              if (!response.ok) {
                throw new Error(`Upload failed with ${response.status}`)
              }

              done += 1
              setJobState(job.key, { kind: "uploading", done, total })
            }
          }),
        )
        await ensureSuccess(
          await api.chapters[":id"].pages.finalize.$post(
            { param: { id: created.id }, json: { taskId: session.taskId } },
            { init: { signal: controller.signal } },
          ),
        )

        processing.set(job.key, {
          batchId: batch.id,
          chapterId: created.id,
          taskId: session.taskId,
          review: created.status === "PENDING",
          publishAt: job.publishAt,
          since: Date.now(),
        })
        setJobState(job.key, { kind: "processing" })
        pollTimer ??= setInterval(() => {
          void poll()
        }, POLL_INTERVAL_MS)
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
    }),
  )
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
    done: jobs.filter((job) => job.state.kind === "done").length,
    busy: jobs.some((job) => isBusy(job.state)),
  }
}
