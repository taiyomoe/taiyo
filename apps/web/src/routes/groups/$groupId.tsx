import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import {
  groupChaptersQueryOptions,
  groupMembersQueryOptions,
  groupQueryOptions,
} from "@/features/groups/api/groups"
import { GROUP_CHAPTERS_PER_PAGE } from "@/features/groups/components/group/group-chapters"
import { GroupPage } from "@/features/groups/components/group/group-page"
import { getContentRatings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/groups/$groupId")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: async ({ context, params: { groupId }, deps: { page } }) => {
    const group = context.queryClient.query(groupQueryOptions(groupId))
    const prefetch = Promise.all(
      [
        group,
        context.queryClient.query(groupMembersQueryOptions(groupId)),
        context.queryClient.query(
          groupChaptersQueryOptions(
            groupId,
            getContentRatings(context.session),
            page,
            GROUP_CHAPTERS_PER_PAGE,
          ),
        ),
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
            ? m.group_meta_title_fallback()
            : m.group_meta_title({ name: loaderData.name }),
      },
    ],
  }),
  component: GroupPage,
})
