import type { CommentReportReason, CommentReportStatus } from "@taiyomoe/db/constants"
import type { InferResponseType } from "hono/client"
import { keepPreviousData, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { unwrap, unwrapEnvelope } from "@/lib/envelope"

export const REVIEW_REPORTS_PER_PAGE = 20

export type ReviewReportsFilter = {
  status: CommentReportStatus
  reason?: CommentReportReason | undefined
  page: number
}

export type ReportedReview = InferResponseType<
  (typeof api)["review-reports"]["$get"],
  200
>["data"][number]

export const reviewReportsQueryOptions = (filter: ReviewReportsFilter) =>
  queryOptions({
    queryKey: ["review-reports", filter],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api["review-reports"].$get(
          {
            query: {
              status: filter.status,
              page: String(filter.page),
              perPage: String(REVIEW_REPORTS_PER_PAGE),
              ...(filter.reason === undefined ? {} : { reason: filter.reason }),
            },
          },
          { init: { signal } },
        ),
      ),
    placeholderData: keepPreviousData,
  })

export const useCloseReviewReports = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (json: { reportIds: string[]; status: "RESOLVED" | "DISMISSED" }) =>
      unwrap(await api["review-reports"].$patch({ json })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["review-reports"] }),
  })
}
