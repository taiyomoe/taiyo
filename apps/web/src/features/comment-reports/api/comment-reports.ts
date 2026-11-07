import type { CommentReportStatus } from "@taiyomoe/db/constants"
import type { InferResponseType } from "hono/client"
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { unwrap, unwrapEnvelope } from "@/lib/envelope"

export const COMMENT_REPORTS_PER_PAGE = 20

export type ReportedComment = InferResponseType<
  (typeof api)["comment-reports"]["$get"],
  200
>["data"][number]

export const commentReportsQueryOptions = (status: CommentReportStatus, page: number) =>
  queryOptions({
    queryKey: ["comment-reports", { status, page }],
    queryFn: async ({ signal }) => {
      const response = await api["comment-reports"].$get(
        { query: { status, page: String(page), perPage: String(COMMENT_REPORTS_PER_PAGE) } },
        { init: { signal } },
      )

      return unwrapEnvelope<Awaited<ReturnType<typeof response.json>>>(response)
    },
  })

export function useCloseCommentReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "RESOLVED" | "DISMISSED" }) => {
      const response = await api["comment-reports"][":id"].$patch({
        param: { id },
        json: { status },
      })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["comment-reports"] }),
  })
}

export function useModerateDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.comments[":id"].$delete({ param: { id } })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["comment-reports"] }),
        queryClient.invalidateQueries({ queryKey: ["comments"] }),
      ]),
  })
}
