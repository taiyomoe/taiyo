import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import {
  myGroupCreationRequestsQueryOptions,
  myGroupsQueryOptions,
  myOwnershipRequestsQueryOptions,
} from "@/features/groups/api/groups"
import { ManageGroupsPage } from "@/features/groups/components/manage-groups/manage-groups-page"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/dashboard/groups/")({
  head: () => ({ meta: [{ title: m.my_groups_meta_title() }] }),
  loader: async ({ context }) => {
    const prefetch = Promise.all(
      [
        context.queryClient.query(myGroupsQueryOptions),
        context.queryClient.query(myOwnershipRequestsQueryOptions),
        context.queryClient.query(myGroupCreationRequestsQueryOptions),
      ].map((query) => query.catch(noop)),
    )

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: ManageGroupsPage,
})
