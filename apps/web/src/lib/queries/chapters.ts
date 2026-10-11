import { queryOptions } from "@tanstack/react-query"

import { api } from "@/lib/api"
import { unwrap, unwrapEnvelope } from "@/lib/envelope"

export const chapterQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["chapters", id],
    queryFn: async ({ signal }) =>
      unwrap(await api.chapters[":id"].$get({ param: { id } }, { init: { signal } })),
  })

export const latestChaptersQueryOptions = ({ page, perPage }: { page: number; perPage: number }) =>
  queryOptions({
    queryKey: ["chapters", "latest", { page, perPage }],
    queryFn: async ({ signal }) =>
      unwrapEnvelope(
        await api.chapters.latest.$get(
          { query: { page: String(page), perPage: String(perPage) } },
          { init: { signal } },
        ),
      ),
  })
