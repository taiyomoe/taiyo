import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Outlet, getRouteApi } from "@tanstack/react-router"
import { useEffect } from "react"
import { AppShell } from "@/components/shell/app-shell"
import { myOverviewQueryOptions } from "@/features/dashboard/api/my-overview"
import { getVisibleQueues } from "@/features/dashboard/lib/dashboard-queues"
import { DASHBOARD_SECTIONS } from "@/features/dashboard/lib/dashboard-sections"
import { usePermissions } from "@/lib/permissions"

const routeApi = getRouteApi("/dashboard")

export function DashboardLayout() {
  const { session } = routeApi.useRouteContext()
  const can = usePermissions(session.user)
  const queryClient = useQueryClient()
  const { data: overview } = useQuery(myOverviewQueryOptions)
  const counts = new Map<string, number>([
    ...getVisibleQueues(overview?.queues).map(({ to, count }) => [to, count] as const),
    ...(overview === undefined ? [] : [["/dashboard/invitations", overview.invitations] as const]),
  ])

  // Any action taken in the dashboard can empty a queue: refresh the counts after each one.
  useEffect(
    () =>
      queryClient.getMutationCache().subscribe((event) => {
        if (event.type === "updated" && event.action.type === "success") {
          void queryClient.invalidateQueries({ queryKey: myOverviewQueryOptions.queryKey })
        }
      }),
    [queryClient],
  )

  return (
    <AppShell
      sections={DASHBOARD_SECTIONS.map(({ items, ...section }) => ({
        ...section,
        items: items
          .filter((item) => item.visible(can))
          .map((item) => ({ ...item, count: counts.get(item.to ?? "") })),
      })).filter((section) => section.items.length > 0)}
      user={session.user}
    >
      <Outlet />
    </AppShell>
  )
}
