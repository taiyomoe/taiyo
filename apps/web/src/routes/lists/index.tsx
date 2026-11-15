import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { myListsQueryOptions, topListsQueryOptions } from "@/features/lists/api/lists"
import { ListsPage } from "@/features/lists/components/lists-page/lists-page"
import { getContentRatings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/lists/")({
  head: () => ({ meta: [{ title: m.lists_meta_title() }] }),
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: async ({ context, deps: { page } }) => {
    const contentRatings = getContentRatings(context.session)
    const prefetch = Promise.all([
      context.queryClient.query(topListsQueryOptions(page, contentRatings)),
      context.session === null
        ? null
        : context.queryClient.query(myListsQueryOptions(contentRatings)),
    ]).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: ListsPage,
})
