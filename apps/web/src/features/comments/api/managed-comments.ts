import type { CommentTargetType } from "@taiyomoe/db/constants"
import type { InferResponseType } from "hono/client"
import { keepPreviousData, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { CATALOG_PER_PAGE } from "@/features/catalog/api/catalog"
import { api } from "@/lib/api"
import { unwrap, unwrapEnvelope } from "@/lib/envelope"

export type ManagedCommentsFilter = {
  search?: string | undefined
  target?: CommentTargetType | undefined
  authorId?: string | undefined
  deleted?: boolean | undefined
  page: number
}

export type ManagedComment = InferResponseType<
  typeof api.comments.managed.$get,
  200
>["data"][number]

export const managedCommentsQueryOptions = (filter: ManagedCommentsFilter) =>
  queryOptions({
    queryKey: ["comments", "manage", filter],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.comments.managed.$get(
          {
            query: {
              page: String(filter.page),
              perPage: String(CATALOG_PER_PAGE),
              ...(filter.search === undefined ? {} : { search: filter.search }),
              ...(filter.target === undefined ? {} : { target: filter.target }),
              ...(filter.authorId === undefined ? {} : { authorId: filter.authorId }),
              ...(filter.deleted === true ? { deleted: "true" } : {}),
            },
          },
          { init: { signal } },
        ),
      ),
    placeholderData: keepPreviousData,
  })

export const useDeleteComments = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (commentIds: string[]) =>
      unwrap(await api.comments.$delete({ json: { commentIds } })),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["comments"] }),
        queryClient.invalidateQueries({ queryKey: ["comment-reports"] }),
      ]),
  })
}
