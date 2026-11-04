import { createFileRoute, redirect } from "@tanstack/react-router"
import { ActivityLogPage } from "@/features/activity-log/components/activity-log-page"
import { activityLogSearchSchema } from "@/features/activity-log/lib/activity-log"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/dashboard/activity-log")({
  head: () => ({ meta: [{ title: m.activity_meta_title() }] }),
  validateSearch: activityLogSearchSchema,
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("auditLog.read")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: ActivityLogPage,
})
