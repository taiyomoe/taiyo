import type { InferRequestType, InferResponseType } from "hono/client"
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

export const pendingSubmissionsCountQueryOptions = queryOptions({
  queryKey: ["chapter-review", "mine", "pending-count"],
  queryFn: async ({ signal }) =>
    (
      await unwrapEnvelope(
        await api.users.me["chapter-submissions"].$get(
          { query: { status: "PENDING", page: "1", perPage: "1" } },
          { init: { signal } },
        ),
      )
    ).meta.total,
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

export function useBulkReview() {
  const invalidate = useInvalidateReview()

  return useMutation({
    mutationFn: async ({ chapterIds, reason }: { chapterIds: string[]; reason?: string }) => {
      if (reason === undefined) {
        const response = await api.chapters.approve.$post({ json: { chapterIds } })

        return (await unwrap<Awaited<ReturnType<typeof response.json>>>(response)).skipped.length
      }

      const response = await api.chapters.reject.$post({ json: { chapterIds, reason } })

      return (await unwrap<Awaited<ReturnType<typeof response.json>>>(response)).skipped.length
    },
    onSuccess: invalidate,
  })
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

export function useScheduleChapter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, publishAt }: { id: string; publishAt: string | null }) =>
      ensureSuccess(await api.chapters[":id"].$patch({ param: { id }, json: { publishAt } })),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["chapter-review"] }),
        queryClient.invalidateQueries({ queryKey: ["chapters"] }),
        queryClient.invalidateQueries({ queryKey: ["medias"] }),
      ]),
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
