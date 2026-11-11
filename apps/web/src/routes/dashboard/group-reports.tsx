import { createFileRoute, redirect } from "@tanstack/react-router"
import { GroupReportsPage } from "@/features/groups/components/group-reports/group-reports-page"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/dashboard/group-reports")({
  head: () => ({ meta: [{ title: m.reports_meta_title() }] }),
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("groupReport.review")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: GroupReportsPage,
})
