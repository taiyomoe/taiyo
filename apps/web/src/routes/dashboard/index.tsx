import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { createIsomorphicFn } from "@tanstack/react-start"
import { z } from "zod"
import { OverviewPage } from "@/components/dashboard/overview/overview-page"
import { DEFAULT_DASHBOARD_RANGE, DASHBOARD_RANGES } from "@/lib/dashboard"
import { dashboardOverviewQueryOptions } from "@/lib/queries/dashboard"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  range: z.enum(DASHBOARD_RANGES).optional().catch(undefined),
  compare: z.boolean().optional().catch(undefined),
})
const getTimeZone = createIsomorphicFn()
  .server(() => null)
  .client(() => new Intl.DateTimeFormat().resolvedOptions().timeZone)

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: m.dashboard_overview_meta_title() }] }),
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ range: search.range ?? DEFAULT_DASHBOARD_RANGE }),
  context: ({ deps }) => ({
    overviewQueryOptions: dashboardOverviewQueryOptions(deps.range, getTimeZone()),
  }),
  loader: ({ context }) => {
    if (!import.meta.env.SSR) {
      void context.queryClient.query(context.overviewQueryOptions).catch(noop)
    }
  },
  component: function Overview() {
    const { session, overviewQueryOptions } = Route.useRouteContext()
    const { range } = Route.useLoaderDeps()
    const { compare = true } = Route.useSearch()

    return (
      <OverviewPage
        compare={compare}
        queryOptions={overviewQueryOptions}
        range={range}
        user={session.user}
      />
    )
  },
})
