import { noop } from "@tanstack/react-query"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { isNotFoundError } from "@/components/boundaries/not-found-page"
import {
  groupMembersQueryOptions,
  groupQueryOptions,
  myGroupsQueryOptions,
} from "@/features/groups/api/groups"
import { ManageGroupNotFound } from "@/features/groups/components/manage-group/manage-group-not-found"
import { ManageGroupPage } from "@/features/groups/components/manage-group/manage-group-page"
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

    return {
      name: await group
        .then((data) => data.name)
        .catch((error: unknown) => {
          if (isNotFoundError(error, "GROUP_NOT_FOUND")) {
            throw notFound()
          }

          return null
        }),
    }
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
  component: ManageGroupPage,
  notFoundComponent: ManageGroupNotFound,
})
