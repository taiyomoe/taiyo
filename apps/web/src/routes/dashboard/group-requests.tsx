import { createFileRoute, redirect } from "@tanstack/react-router"
import { GroupRequestsPage } from "@/components/groups/group-requests-page"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/dashboard/group-requests")({
  head: () => ({ meta: [{ title: m.review_meta_title() }] }),
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("ownershipRequest.review")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: GroupRequestsPage,
})
