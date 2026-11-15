import type { PageReportStatus } from "@taiyomoe/db/constants"
import type { InferResponseType } from "hono/client"
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { unwrap, unwrapEnvelope } from "@/lib/envelope"

export const PAGE_REPORTS_PER_PAGE = 20

export type PageReport = InferResponseType<
  (typeof api.chapters)["page-reports"]["$get"],
  200
>["data"][number]

export const pageReportsQueryOptions = (status: PageReportStatus, page: number) =>
  queryOptions({
    queryKey: ["page-reports", { status, page }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.chapters["page-reports"].$get(
          {
            query: { status, page: String(page), perPage: String(PAGE_REPORTS_PER_PAGE) },
          },
          { init: { signal } },
        ),
      ),
  })

export function useClosePageReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "RESOLVED" | "DISMISSED" }) => {
      const response = await api.chapters["page-reports"][":reportId"].$patch({
        param: { reportId: id },
        json: { status },
      })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["page-reports"] }),
  })
}
