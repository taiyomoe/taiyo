import type { InferRequestType, InferResponseType } from "hono/client"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"
import { m } from "@/paraglide/messages"

const MAX_BOOKMARKS = 100

export type PageBookmark = InferResponseType<
  typeof api.users.me.bookmarks.$get,
  200
>["data"][number]

export type PageReportInput = InferRequestType<
  (typeof api.chapters)[":id"]["pages"][":pageId"]["reports"]["$post"]
>["json"]

type PageRef = { chapterId: string; pageId: string }

export const mediaBookmarksQueryOptions = (mediaId: string) =>
  queryOptions({
    queryKey: ["bookmarks", mediaId],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.users.me.bookmarks.$get(
          { query: { mediaId, perPage: String(MAX_BOOKMARKS) } },
          { init: { signal } },
        ),
      ),
  })

export function useToggleBookmark(mediaId: string) {
  const queryClient = useQueryClient()
  const { queryKey } = mediaBookmarksQueryOptions(mediaId)

  return useMutation({
    mutationFn: async ({ chapterId, pageId, bookmarked }: PageRef & { bookmarked: boolean }) => {
      const endpoint = api.chapters[":id"].bookmarks[":pageId"]
      const param = { id: chapterId, pageId }
      const response = bookmarked
        ? await endpoint.$put({ param })
        : await endpoint.$delete({ param })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
    onMutate: async ({ chapterId, pageId, bookmarked }) => {
      await queryClient.cancelQueries({ queryKey })

      const previous = queryClient.getQueryData(queryKey)

      if (!bookmarked) {
        queryClient.setQueryData(queryKey, (bookmarks) =>
          bookmarks?.filter(
            (bookmark) => bookmark.chapterId !== chapterId || bookmark.pageId !== pageId,
          ),
        )
      }

      return { previous }
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
      toastManager.add({ title: m.reader_bookmark_failed(), type: "error" })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  })
}

export function useReportPage() {
  return useMutation({
    mutationFn: async ({ chapterId, pageId, ...json }: PageRef & PageReportInput) => {
      const response = await api.chapters[":id"].pages[":pageId"].reports.$post({
        param: { id: chapterId, pageId },
        json,
      })

      return unwrap<Awaited<ReturnType<typeof response.json>>>(response)
    },
  })
}
