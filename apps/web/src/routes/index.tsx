import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { latestChaptersQueryOptions } from "@/features/chapters/api/chapters"
import { IndexPage } from "@/features/home/components/index-page"
import { LATEST_TITLES_COUNT } from "@/features/home/lib/latest-titles"
import { LATEST_UPDATES_PER_PAGE } from "@/features/home/lib/latest-updates"
import { featuredMediasQueryOptions, showcaseMediasQueryOptions } from "@/features/media/api/medias"
import { recentlyAddedQueryOptions } from "@/features/recently-added/api/recently-added"
import { getContentRatings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/")({
  head: ({ match }) => ({
    meta: match.context.session
      ? []
      : [
          { title: m.landing_meta_title() },
          { name: "description", content: m.landing_meta_description() },
        ],
  }),
  loader: async ({ context }) => {
    const { queryClient, session } = context
    const prefetch = session
      ? Promise.all([
          queryClient.query(featuredMediasQueryOptions(getContentRatings(session))).catch(noop),
          queryClient
            .query(latestChaptersQueryOptions(getContentRatings(session), LATEST_UPDATES_PER_PAGE))
            .catch(noop),
          queryClient
            .query(recentlyAddedQueryOptions(getContentRatings(session), 1, LATEST_TITLES_COUNT))
            .catch(noop),
        ])
      : queryClient.query(showcaseMediasQueryOptions()).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: IndexPage,
})
