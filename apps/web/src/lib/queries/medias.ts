import { queryOptions } from "@tanstack/react-query"
import type { InferRequestType } from "hono/client"

import { api } from "@/lib/api"
import { unwrapEnvelope } from "@/lib/envelope"

export type SearchMediasBody = InferRequestType<typeof api.medias.search.$post>["json"]

export const searchMediasQueryOptions = (body: SearchMediasBody) =>
  queryOptions({
    queryKey: ["medias", "search", body],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(await api.medias.search.$post({ json: body }, { init: { signal } })),
  })
