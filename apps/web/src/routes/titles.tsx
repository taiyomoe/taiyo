import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { AdvancedSearchPage } from "@/features/advanced-search/components/advanced-search-page"
import {
  advancedSearchSchema,
  parseAdvancedSearch,
  toSearchBody,
} from "@/features/advanced-search/lib/advanced-search"
import { searchMediasQueryOptions } from "@/features/media/api/medias"
import { getContentRatings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/titles")({
  head: () => ({
    meta: [
      { title: m.search_meta_title() },
      { name: "description", content: m.search_meta_description() },
    ],
  }),
  validateSearch: advancedSearchSchema,
  loaderDeps: ({ search: { view: _view, ...deps } }) => deps,
  loader: async ({ context, deps }) => {
    const prefetch = context.queryClient
      .query(
        searchMediasQueryOptions(
          toSearchBody(parseAdvancedSearch(deps), getContentRatings(context.session)),
        ),
      )
      .catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: AdvancedSearchPage,
})
