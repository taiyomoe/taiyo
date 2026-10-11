import { queryOptions } from "@tanstack/react-query"
import type { InferRequestType, InferResponseType } from "hono/client"

import { api } from "@/lib/api"
import { unwrap, unwrapEnvelope } from "@/lib/envelope"

export type SearchMediasBody = InferRequestType<typeof api.medias.search.$post>["json"]

export type MediaHit = Extract<
  InferResponseType<typeof api.medias.search.$post>,
  { success: true }
>["data"][number]

export type MediaDetail = Extract<
  InferResponseType<(typeof api.medias)[":id"]["$get"]>,
  { success: true }
>["data"]

export type MediaChapter = Extract<
  InferResponseType<(typeof api.medias)[":id"]["chapters"]["$get"]>,
  { success: true }
>["data"][number]

const MAX_PER_PAGE = 100

export const searchMediasQueryOptions = (body: SearchMediasBody) =>
  queryOptions({
    queryKey: ["medias", "search", body],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(await api.medias.search.$post({ json: body }, { init: { signal } })),
  })

export const mediaQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["medias", id],
    queryFn: async ({ signal }) =>
      unwrap(await api.medias[":id"].$get({ param: { id } }, { init: { signal } })),
  })

export const mediaChaptersQueryOptions = (
  id: string,
  { page, perPage }: { page: number; perPage: number },
) =>
  queryOptions({
    queryKey: ["medias", id, "chapters", { page, perPage }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.medias[":id"].chapters.$get(
          { param: { id }, query: { page: String(page), perPage: String(perPage) } },
          { init: { signal } },
        ),
      ),
  })

export const allMediaChaptersQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["medias", id, "chapters", "all"],
    queryFn: async ({ signal }) => {
      const fetchPage = async (page: number) =>
        unwrapEnvelope(
          await api.medias[":id"].chapters.$get(
            { param: { id }, query: { page: String(page), perPage: String(MAX_PER_PAGE) } },
            { init: { signal } },
          ),
        )
      const first = await fetchPage(1)
      const pageCount = Math.ceil(first.meta.total / MAX_PER_PAGE)
      const rest = await Promise.all(
        Array.from({ length: Math.max(pageCount - 1, 0) }, (_, i) => fetchPage(i + 2)),
      )

      return [first, ...rest].flatMap((envelope) => envelope.data)
    },
  })
