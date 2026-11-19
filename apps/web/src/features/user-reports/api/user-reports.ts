import type { InferRequestType, InferResponseType } from "hono/client"
import { keepPreviousData, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { CATALOG_PER_PAGE } from "@/features/catalog/api/catalog"
import { myOverviewQueryOptions } from "@/features/dashboard/api/my-overview"
import { api } from "@/lib/api"
import { ensureSuccess, unwrap, unwrapEnvelope } from "@/lib/envelope"

export type UserReportInput = InferRequestType<
  (typeof api.users)[":id"]["reports"]["$post"]
>["json"]

export type UserReport = InferResponseType<
  (typeof api)["user-reports"]["$get"],
  200
>["data"][number]

export type UserReportsFilter = {
  status: UserReport["status"]
  reason?: UserReport["reason"] | undefined
  page: number
}

export const userReportsQueryOptions = ({ status, reason, page }: UserReportsFilter) =>
  queryOptions({
    queryKey: ["user-reports", { status, reason, page }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api["user-reports"].$get(
          {
            query: {
              status,
              page: String(page),
              perPage: String(CATALOG_PER_PAGE),
              ...(reason === undefined ? {} : { reason }),
            },
          },
          { init: { signal } },
        ),
      ),
    placeholderData: keepPreviousData,
  })

export const useReportUser = (userId: string) =>
  useMutation({
    mutationFn: async (json: UserReportInput) =>
      ensureSuccess(await api.users[":id"].reports.$post({ param: { id: userId }, json })),
  })

export const useReviewUserReports = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (json: {
      reportIds: string[]
      status: "RESOLVED" | "DISMISSED"
      note?: string
    }) => unwrap(await api["user-reports"].review.$post({ json })),
    // The dashboard badges count the pending reports.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user-reports"] }),
        queryClient.invalidateQueries({ queryKey: myOverviewQueryOptions.queryKey }),
      ]),
  })
}
