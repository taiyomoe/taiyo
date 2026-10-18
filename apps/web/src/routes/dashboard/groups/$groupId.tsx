import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { ManageGroupPage } from "@/components/groups/manage-group-page"
import {
  groupMembersQueryOptions,
  groupQueryOptions,
  myGroupsQueryOptions,
} from "@/lib/queries/groups"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/dashboard/groups/$groupId")({
  loader: async ({ context, params: { groupId } }) => {
    const group = context.queryClient.query(groupQueryOptions(groupId))
    const prefetch = Promise.all(
      [
        group,
        context.queryClient.query(groupMembersQueryOptions(groupId)),
        context.queryClient.query(myGroupsQueryOptions),
      ].map((query) => query.catch(noop)),
    )

    if (import.meta.env.SSR) {
      await prefetch
    }

    return { name: await group.then((data) => data.name).catch(() => null) }
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title:
          loaderData?.name === null || loaderData?.name === undefined
            ? m.my_groups_meta_title()
            : m.manage_group_meta_title({ name: loaderData.name }),
      },
    ],
  }),
  component: ManageGroup,
})

function ManageGroup() {
  const { session } = Route.useRouteContext()
  const { groupId } = Route.useParams()

  return <ManageGroupPage groupId={groupId} user={session.user} />
}
