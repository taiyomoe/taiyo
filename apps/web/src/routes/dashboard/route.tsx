import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { DASHBOARD_SECTIONS } from "@/components/dashboard/dashboard-sections"
import { AppShell } from "@/components/shell/app-shell"
import { canOpenDashboard } from "@/lib/dashboard"

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
  component: function Dashboard() {
    const { session } = Route.useRouteContext()

    return (
      <AppShell sections={DASHBOARD_SECTIONS} user={session.user}>
        <Outlet />
      </AppShell>
    )
  },
})
