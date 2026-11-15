import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { recentlyAddedQueryOptions } from "@/features/recently-added/api/recently-added"
import { RecentlyAddedPage } from "@/features/recently-added/components/recently-added-page"
import { getContentRatings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const FIRST_PAGE = 1
const searchSchema = z.object({
  page: z.coerce.number().int().min(FIRST_PAGE).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/recently-added")({
  head: () => ({ meta: [{ title: m.recently_added_meta_title() }] }),
  validateSearch: searchSchema,
  loaderDeps: ({ search: { page } }) => ({ page: page ?? FIRST_PAGE }),
  loader: async ({ context, deps: { page } }) => {
    const prefetch = context.queryClient
      .query(recentlyAddedQueryOptions(getContentRatings(context.session), page))
      .catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: RecentlyAddedPage,
})
