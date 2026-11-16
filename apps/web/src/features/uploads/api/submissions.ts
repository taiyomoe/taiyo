import type { ChapterStatus, SupportedLanguage } from "@taiyomoe/db/constants"
import type { InferRequestType, InferResponseType } from "hono/client"
import { keepPreviousData, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import type { BulkResult } from "@/features/catalog/api/catalog"
import { api } from "@/lib/api"
import { ensureSuccess, unwrap, unwrapEnvelope } from "@/lib/envelope"

export const SUBMISSIONS_PER_PAGE = 20

export type ReviewQueueFilter = {
  search?: string | undefined
  language?: SupportedLanguage | undefined
  page: number
}

export type SubmissionsFilter = {
  search?: string | undefined
  status?: ChapterStatus | undefined
  page: number
}

export const reviewQueueQueryOptions = (filter: ReviewQueueFilter) =>
  queryOptions({
    queryKey: ["chapter-review", "queue", filter],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.chapters["review-queue"].$get(
          {
            query: {
              page: String(filter.page),
              perPage: String(SUBMISSIONS_PER_PAGE),
              ...(filter.search === undefined ? {} : { search: filter.search }),
              ...(filter.language === undefined ? {} : { language: filter.language }),
            },
          },
          { init: { signal } },
        ),
      ),
    placeholderData: keepPreviousData,
  })

export type ChapterSubmission = InferResponseType<
  (typeof api.chapters)["review-queue"]["$get"],
  200
>["data"][number]

export const mySubmissionsQueryOptions = (filter: SubmissionsFilter) =>
  queryOptions({
    queryKey: ["chapter-review", "mine", filter],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.users.me["chapter-submissions"].$get(
          {
            query: {
              page: String(filter.page),
              perPage: String(SUBMISSIONS_PER_PAGE),
              ...(filter.search === undefined ? {} : { search: filter.search }),
              ...(filter.status === undefined ? {} : { status: filter.status }),
            },
          },
          { init: { signal } },
        ),
      ),
    placeholderData: keepPreviousData,
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

export const useInvalidateReview = () => {
  const queryClient = useQueryClient()

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["chapter-review"] }),
      queryClient.invalidateQueries({ queryKey: ["chapters"] }),
    ])
}

const useReviewMutation = <TInput>(run: (input: TInput) => Promise<BulkResult>) => {
  const invalidate = useInvalidateReview()

  return useMutation({ mutationFn: run, onSuccess: invalidate })
}

export const useApproveChapters = () =>
  useReviewMutation(async (chapterIds: string[]) => {
    const { approved, skipped } = await unwrap(
      await api.chapters.approve.$post({ json: { chapterIds } }),
    )

    return { done: approved, skipped }
  })

export const useRejectChapters = () =>
  useReviewMutation(async ({ chapterIds, reason }: { chapterIds: string[]; reason: string }) => {
    const { rejected, skipped } = await unwrap(
      await api.chapters.reject.$post({ json: { chapterIds, reason } }),
    )

    return { done: rejected, skipped }
  })

export const useWithdrawChapters = () =>
  useReviewMutation(async (chapterIds: string[]) =>
    unwrap(await api.chapters.withdraw.$post({ json: { chapterIds } })),
  )

export type ChapterUpdate = InferRequestType<(typeof api.chapters)[":id"]["$patch"]>["json"]

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
