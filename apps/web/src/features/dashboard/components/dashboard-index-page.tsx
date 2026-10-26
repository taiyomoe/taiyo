import { getRouteApi } from "@tanstack/react-router"
import { DashboardHome } from "@/features/dashboard/components/home/dashboard-home"
import { OverviewPage } from "@/features/dashboard/components/overview/overview-page"
import { getPermissions } from "@/lib/permissions"

const routeApi = getRouteApi("/dashboard/")

export function DashboardIndexPage() {
  const { session, overviewQueryOptions } = routeApi.useRouteContext()
  const { range } = routeApi.useLoaderDeps()
  const { compare = true } = routeApi.useSearch()

  if (!getPermissions(session.user)("dashboard.viewStats")) {
    return <DashboardHome name={session.user.name} />
  }

  return (
    <OverviewPage
      compare={compare}
      queryOptions={overviewQueryOptions}
      range={range}
      user={session.user}
    />
  )
}
