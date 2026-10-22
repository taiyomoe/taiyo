import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { DASHBOARD_SECTIONS } from "@/components/dashboard/dashboard-sections"
import { AppShell } from "@/components/shell/app-shell"
import { canOpenDashboard } from "@/lib/dashboard"
import { getPermissions } from "@/lib/permissions"

export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/auth/sign-in" })
    }

    if (!canOpenDashboard(context.session.user)) {
      throw redirect({ to: "/" })
    }

    return { session: context.session }
  },
  component: Dashboard,
})

function Dashboard() {
  const { session } = Route.useRouteContext()
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
