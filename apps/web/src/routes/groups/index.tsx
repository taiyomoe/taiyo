import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { GroupsPage } from "@/components/groups/groups-page"
import { groupsQueryOptions } from "@/lib/queries/groups"
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
  component: Groups,
})

function Groups() {
  const { session } = Route.useRouteContext()
  const { q, page } = Route.useLoaderDeps()

  return <GroupsPage page={page} search={q} user={session?.user ?? null} />
}
