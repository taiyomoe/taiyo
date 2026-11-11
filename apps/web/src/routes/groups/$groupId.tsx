import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { commentsQueryOptions } from "@/features/comments/api/comments"
import {
  groupChaptersQueryOptions,
  groupMediaUpdatesQueryOptions,
  groupMediasQueryOptions,
  groupMembersQueryOptions,
  groupQueryOptions,
  groupStatsQueryOptions,
} from "@/features/groups/api/groups"
import { GroupPage, GroupPageSkeleton } from "@/features/groups/components/group/group-page"
import {
  GROUP_CHAPTER_ORDERS,
  GROUP_LATEST_RELEASES,
  GROUP_MEDIA_SORTS,
  GROUP_MEDIAS_PER_PAGE,
  GROUP_TABS,
  GROUP_TITLES_PER_PAGE,
} from "@/features/groups/lib/group-page"
import { getContentRatings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  tab: z.enum(GROUP_TABS).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
  comment: z.uuid().optional().catch(undefined),
  q: z.string().trim().min(1).max(100).optional().catch(undefined),
  title: z.uuid().optional().catch(undefined),
  order: z.enum(GROUP_CHAPTER_ORDERS).optional().catch(undefined),
  sort: z.enum(GROUP_MEDIA_SORTS).optional().catch(undefined),
})

export const Route = createFileRoute("/groups/$groupId")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, params: { groupId }, deps }) => {
    const contentRatings = getContentRatings(context.session)
    const page = deps.page ?? 1
    const group = context.queryClient.query(groupQueryOptions(groupId))
    const tab = {
      info: () => [
        context.queryClient.query(groupMembersQueryOptions(groupId)),
        context.queryClient.query(groupStatsQueryOptions(groupId, contentRatings)),
        context.queryClient.query(
          groupChaptersQueryOptions(groupId, contentRatings, 1, GROUP_LATEST_RELEASES),
        ),
      ],
      chapters: () => [
        context.queryClient.query(
          groupMediaUpdatesQueryOptions(groupId, contentRatings, {
            page,
            perPage: GROUP_MEDIAS_PER_PAGE,
            order: deps.order ?? "latest",
            search: deps.q,
            mediaId: deps.title,
          }),
        ),
      ],
      titles: () => [
        context.queryClient.query(
          groupMediasQueryOptions(groupId, contentRatings, {
            page,
            perPage: GROUP_TITLES_PER_PAGE,
            sort: deps.sort ?? "recent",
          }),
        ),
      ],
      members: () => [context.queryClient.query(groupMembersQueryOptions(groupId))],
      comments: () => [
        context.queryClient.infiniteQuery(
          commentsQueryOptions({ type: "GROUP", id: groupId }, "newest"),
        ),
      ],
      stats: () => [context.queryClient.query(groupStatsQueryOptions(groupId, contentRatings))],
    }[deps.tab ?? "info"]
    const prefetch = Promise.all([group, ...tab()].map((query) => query.catch(noop)))

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
  pendingComponent: GroupPageSkeleton,
})
