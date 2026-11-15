import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { myGroupInvitationsQueryOptions } from "@/features/groups/api/groups"
import { InvitationsPage } from "@/features/groups/components/invitations/invitations-page"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/dashboard/invitations")({
  head: () => ({ meta: [{ title: m.my_invitations_meta_title() }] }),
  loader: async ({ context }) => {
    const prefetch = context.queryClient.query(myGroupInvitationsQueryOptions).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: InvitationsPage,
})
