import type { InferRequestType, InferResponseType } from "hono/client"
import { queryOptions } from "@tanstack/react-query"
import type { ContentRating } from "@/lib/settings"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"

export type LibraryStatus = InferRequestType<
  (typeof api.users.me.library)[":mediaId"]["$put"]
>["json"]["status"]

export type ReadingProgress = InferResponseType<
  (typeof api.users.me.progress)[":mediaId"]["$get"],
  200
>["data"]

export const libraryEntryQueryOptions = (mediaId: string) =>
  queryOptions({
    queryKey: ["library", mediaId],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.users.me.library[":mediaId"].$get({ param: { mediaId } }, { init: { signal } }),
      ),
  })

export const readingProgressQueryOptions = (
  mediaId: string,
  contentRatings: readonly ContentRating[],
) =>
  queryOptions({
    queryKey: ["progress", mediaId, { contentRatings }],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.users.me.progress[":mediaId"].$get(
          { param: { mediaId }, query: { contentRating: contentRatings.join(",") } },
          { init: { signal } },
        ),
      ),
  })
