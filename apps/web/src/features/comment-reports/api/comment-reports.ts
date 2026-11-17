import type {
  CommentReportReason,
  CommentReportStatus,
  CommentTargetType,
} from "@taiyomoe/db/constants"
import type { InferResponseType } from "hono/client"
import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { api } from "@/lib/api"
import { unwrap, unwrapEnvelope } from "@/lib/envelope"

export const COMMENT_REPORTS_PER_PAGE = 20

export type CommentReportsFilter = {
  status: CommentReportStatus
  reason?: CommentReportReason | undefined
  target?: CommentTargetType | undefined
  page: number
}

export type ReportedComment = InferResponseType<
  (typeof api)["comment-reports"]["$get"],
  200
>["data"][number]

export type CommentReport = ReportedComment["reports"][number]

export const commentReportsQueryOptions = (filter: CommentReportsFilter) =>
  queryOptions({
    queryKey: ["comment-reports", filter],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api["comment-reports"].$get(
          {
            query: {
              status: filter.status,
              page: String(filter.page),
              perPage: String(COMMENT_REPORTS_PER_PAGE),
              ...(filter.reason === undefined ? {} : { reason: filter.reason }),
              ...(filter.target === undefined ? {} : { target: filter.target }),
            },
          },
          { init: { signal } },
        ),
      ),
    placeholderData: keepPreviousData,
  })

/** Every report on one comment with the given status, a page at a time. */
export const commentReportListQueryOptions = (commentId: string, status: CommentReportStatus) =>
  infiniteQueryOptions({
    queryKey: ["comment-reports", "comment", commentId, status],
    queryFn: async ({ pageParam, signal }) => {
      const response = await api.comments[":id"].reports.$get(
        {
          param: { id: commentId },
          query: { status, page: String(pageParam), perPage: String(COMMENT_REPORTS_PER_PAGE) },
        },
        { init: { signal } },
      )

      return unwrapEnvelope<Awaited<ReturnType<typeof response.json>>>(response)
    },
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page * last.meta.perPage < last.meta.total ? last.meta.page + 1 : undefined,
  })

export const useCloseCommentReports = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (json: { reportIds: string[]; status: "RESOLVED" | "DISMISSED" }) =>
      unwrap(await api["comment-reports"].$patch({ json })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["comment-reports"] }),
  })
}
