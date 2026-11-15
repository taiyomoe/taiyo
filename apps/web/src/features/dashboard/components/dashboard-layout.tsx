import { Outlet, getRouteApi } from "@tanstack/react-router"
import { AppShell } from "@/components/shell/app-shell"
import { DASHBOARD_SECTIONS } from "@/features/dashboard/lib/dashboard-sections"
import { getPermissions } from "@/lib/permissions"

const routeApi = getRouteApi("/dashboard")

export function DashboardLayout() {
  const { session } = routeApi.useRouteContext()
  const can = getPermissions(session.user)

  return (
    <AppShell
      sections={DASHBOARD_SECTIONS.map(({ items, ...section }) => ({
        ...section,
        items: items.filter((item) => item.visible(can)),
      })).filter((section) => section.items.length > 0)}
      user={session.user}
    >
      <Outlet />
    </AppShell>
  )
}
