import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { HomePage } from "@/components/home/home-page"
import { LATEST_UPDATES_PER_PAGE } from "@/components/home/latest-updates"
import { LandingPage } from "@/components/landing/landing-page"
import { latestChaptersQueryOptions } from "@/lib/queries/chapters"
import { featuredMediasQueryOptions } from "@/lib/queries/medias"
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
  component: Index,
})

function Index() {
  const { session } = Route.useRouteContext()

  return session ? <HomePage user={session.user} /> : <LandingPage />
}
