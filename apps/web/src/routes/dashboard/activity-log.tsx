import { createFileRoute, redirect } from "@tanstack/react-router"
import { ActivityLogPage } from "@/components/dashboard/activity-log/activity-log-page"
import { activityLogSearchSchema, canReadActivityLog } from "@/lib/activity-log"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/dashboard/activity-log")({
  head: () => ({ meta: [{ title: m.activity_meta_title() }] }),
  validateSearch: activityLogSearchSchema,
  beforeLoad: ({ context }) => {
    if (!canReadActivityLog(context.session.user)) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: ActivityLog,
})

function ActivityLog() {
  return <ActivityLogPage search={Route.useSearch()} />
}
