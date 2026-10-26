import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { latestChaptersQueryOptions } from "@/features/chapters/api/chapters"
import { IndexPage } from "@/features/home/components/index-page"
import { LATEST_UPDATES_PER_PAGE } from "@/features/home/lib/latest-updates"
import { featuredMediasQueryOptions } from "@/features/media/api/medias"
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
    if (context.session) {
      const contentRatings = getContentRatings(context.session)
      const prefetch = Promise.all([
        context.queryClient.query(featuredMediasQueryOptions(contentRatings)).catch(noop),
        context.queryClient
          .query(latestChaptersQueryOptions(contentRatings, LATEST_UPDATES_PER_PAGE))
          .catch(noop),
      ])

      if (import.meta.env.SSR) {
        await prefetch
      }
    }
  },
  component: IndexPage,
})
