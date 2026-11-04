import type { InferResponseType } from "hono/client"
import { queryOptions } from "@tanstack/react-query"
import type { ContentRating } from "@/lib/settings"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"

export const chapterReaderQueryOptions = (
  chapterId: string,
  contentRatings: readonly ContentRating[],
) =>
  queryOptions({
    queryKey: ["chapters", chapterId, "reader", { contentRatings }],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.chapters[":id"].reader.$get(
          { param: { id: chapterId }, query: { contentRating: contentRatings.join(",") } },
          { init: { signal } },
        ),
      ),
    staleTime: 0,
  })

export type ChapterReaderData = InferResponseType<
  (typeof api.chapters)[":id"]["reader"]["$get"],
  200
>["data"]

export type ReaderChapter = ChapterReaderData["chapters"][number]

export type ReaderChapterDetail = InferResponseType<
  (typeof api.chapters)[":id"]["$get"],
  200
>["data"]
