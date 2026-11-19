import type { PageReportReason, PageReportStatus } from "@taiyomoe/db/constants"
import type { InferResponseType } from "hono/client"
import { keepPreviousData, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { unwrap, unwrapEnvelope } from "@/lib/envelope"

export const PAGE_REPORTS_PER_PAGE = 20

export type PageReportsFilter = {
  /** Every status when undefined. */
  status?: PageReportStatus | undefined
  reason?: PageReportReason | undefined
  search?: string | undefined
  page: number
}

export type PageReport = InferResponseType<
  (typeof api.chapters)["page-reports"]["$get"],
  200
>["data"][number]

export const pageReportsQueryOptions = (filter: PageReportsFilter) =>
  queryOptions({
    queryKey: ["page-reports", filter],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.chapters["page-reports"].$get(
          {
            query: {
              page: String(filter.page),
              perPage: String(PAGE_REPORTS_PER_PAGE),
              ...(filter.status === undefined ? {} : { status: filter.status }),
              ...(filter.reason === undefined ? {} : { reason: filter.reason }),
              ...(filter.search === undefined ? {} : { search: filter.search }),
            },
          },
          { init: { signal } },
        ),
      ),
    placeholderData: keepPreviousData,
  })

export function useClosePageReports() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (json: { reportIds: string[]; status: "RESOLVED" | "DISMISSED" }) =>
      unwrap(await api.chapters["page-reports"].$patch({ json })),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["page-reports"] }),
  })
}
