import type { InferRequestType, InferResponseType } from "hono/client"
import { IMAGE_MIME_TYPES, type ImageMimeType } from "@taiyomoe/db/constants"
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { ensureSuccess, unwrap, unwrapEnvelope } from "@/lib/envelope"

export const SUBMISSIONS_PER_PAGE = 20

export const reviewQueueQueryOptions = (page: number) =>
  queryOptions({
    queryKey: ["chapter-review", "queue", { page }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.chapters["review-queue"].$get(
          { query: { page: String(page), perPage: String(SUBMISSIONS_PER_PAGE) } },
          { init: { signal } },
        ),
      ),
  })

export type ChapterSubmission = InferResponseType<
  (typeof api.chapters)["review-queue"]["$get"],
  200
>["data"][number]

export const mySubmissionsQueryOptions = (page: number) =>
  queryOptions({
    queryKey: ["chapter-review", "mine", { page }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.users.me["chapter-submissions"].$get(
          { query: { page: String(page), perPage: String(SUBMISSIONS_PER_PAGE) } },
          { init: { signal } },
        ),
      ),
  })

export const chapterQueryOptions = (chapterId: string) =>
  queryOptions({
    queryKey: ["chapters", chapterId],
    queryFn: async ({ signal }) =>
      unwrap(await api.chapters[":id"].$get({ param: { id: chapterId } }, { init: { signal } })),
  })

export type ApproveFixes = InferRequestType<
  (typeof api.chapters)[":id"]["approve"]["$post"]
>["json"]

const useInvalidateReview = () => {
  const queryClient = useQueryClient()

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["chapter-review"] }),
      queryClient.invalidateQueries({ queryKey: ["chapters"] }),
    ])
}

export function useReviewChapter() {
  const invalidate = useInvalidateReview()

  return useMutation({
    mutationFn: async ({
      id,
      fixes,
      reason,
    }: {
      id: string
      fixes?: ApproveFixes
      reason?: string
    }) =>
      ensureSuccess(
        reason === undefined
          ? await api.chapters[":id"].approve.$post({ param: { id }, json: fixes ?? {} })
          : await api.chapters[":id"].reject.$post({ param: { id }, json: { reason } }),
      ),
    onSuccess: invalidate,
  })
}

export function useWithdrawChapter() {
  const invalidate = useInvalidateReview()

  return useMutation({
    mutationFn: async (id: string) =>
      ensureSuccess(await api.chapters[":id"].withdraw.$post({ param: { id } })),
    onSuccess: invalidate,
  })
}

export const isUploadablePage = (file: File): file is File & { type: ImageMimeType } =>
  Object.hasOwn(IMAGE_MIME_TYPES, file.type)

export type ChapterUploadInput = {
  mediaId: string
  details: Omit<
    InferRequestType<(typeof api.medias)[":id"]["chapters"]["$post"]>["json"],
    "groupIds"
  >
  groupIds: string[]
  pages: Array<File & { type: ImageMimeType }>
}

export type UploadProgress =
  | { step: "creating" }
  | { step: "uploading"; done: number; total: number }
  | { step: "processing" }

const POLL_INTERVAL_MS = 1500
const PARALLEL_UPLOADS = 4
const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

export const uploadChapter = async (
  { mediaId, details, groupIds, pages }: ChapterUploadInput,
  onProgress: (progress: UploadProgress) => void,
) => {
  onProgress({ step: "creating" })

  const createdResponse = await api.medias[":id"].chapters.$post({
    param: { id: mediaId },
    json: { ...details, groupIds },
  })
  const created = await unwrap<Awaited<ReturnType<typeof createdResponse.json>>>(createdResponse)
  const sessionResponse = await api.chapters[":id"].pages["upload-session"].$post({
    param: { id: created.id },
    json: { pages: pages.map((page) => ({ contentType: page.type, size: page.size })) },
  })
  const session = await unwrap<Awaited<ReturnType<typeof sessionResponse.json>>>(sessionResponse)
  let done = 0

  onProgress({ step: "uploading", done, total: pages.length })

  const queue = [...session.pages]
  const worker = async () => {
    for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
      const page = pages[next.index]

      if (page === undefined) {
        throw new Error("Missing page")
      }

      const response = await fetch(next.uploadUrl, {
        method: "PUT",
        body: page,
        headers: { "content-type": page.type },
      })

      if (!response.ok) {
        throw new Error(`Upload failed with ${response.status}`)
      }

      done += 1
      onProgress({ step: "uploading", done, total: pages.length })
    }
  }

  await Promise.all(Array.from({ length: PARALLEL_UPLOADS }, worker))
  await ensureSuccess(
    await api.chapters[":id"].pages.finalize.$post({
      param: { id: created.id },
      json: { taskId: session.taskId },
    }),
  )
  onProgress({ step: "processing" })

  for (;;) {
    const statusResponse = await api.chapters[":id"].pages.status.$get({
      param: { id: created.id },
      query: { taskId: session.taskId },
    })
    const status = await unwrap<Awaited<ReturnType<typeof statusResponse.json>>>(statusResponse)

    if (status.status === "FINISHED") {
      return created
    }

    if (status.status === "FAILED") {
      throw new Error("Processing failed")
    }

    await wait(POLL_INTERVAL_MS)
  }
}

export type ChapterUpdate = InferRequestType<(typeof api.chapters)[":id"]["$patch"]>["json"]

export function useEditChapter() {
  const invalidate = useInvalidateReview()

  return useMutation({
    mutationFn: async ({
      id,
      details,
      pageIds,
    }: {
      id: string
      details: ChapterUpdate | null
      pageIds: string[] | null
    }) => {
      if (details !== null) {
        await ensureSuccess(await api.chapters[":id"].$patch({ param: { id }, json: details }))
      }

      if (pageIds !== null) {
        await ensureSuccess(
          await api.chapters[":id"].pages.$patch({ param: { id }, json: { pageIds } }),
        )
      }
    },
    onSuccess: invalidate,
  })
}

export function useDeleteChapter() {
  const invalidate = useInvalidateReview()

  return useMutation({
    mutationFn: async (id: string) =>
      ensureSuccess(await api.chapters[":id"].$delete({ param: { id } })),
    onSuccess: invalidate,
  })
}
