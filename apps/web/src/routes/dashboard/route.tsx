import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { getDashboardSections } from "@/components/dashboard/dashboard-sections"
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

  return (
    <AppShell sections={getDashboardSections(getPermissions(session.user))} user={session.user}>
      <Outlet />
    </AppShell>
  )
}
