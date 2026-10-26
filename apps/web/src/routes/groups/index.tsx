import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { groupsQueryOptions } from "@/features/groups/api/groups"
import { GroupsPage } from "@/features/groups/components/groups/groups-page"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  q: z.string().trim().min(1).max(100).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/groups/")({
  head: () => ({ meta: [{ title: m.groups_meta_title() }] }),
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ q: search.q, page: search.page ?? 1 }),
  loader: async ({ context, deps: { q, page } }) => {
    const prefetch = context.queryClient.query(groupsQueryOptions({ page, search: q })).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: GroupsPage,
})
