import { createFileRoute, redirect } from "@tanstack/react-router"
import { DashboardLayout } from "@/features/dashboard/components/dashboard-layout"
import { canOpenDashboard } from "@/features/dashboard/lib/dashboard"

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
  component: DashboardLayout,
})
