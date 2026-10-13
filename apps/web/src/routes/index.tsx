import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { HomePage } from "@/components/home/home-page"
import { LandingPage } from "@/components/landing/landing-page"
import { featuredMediasQueryOptions } from "@/lib/queries/medias"
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
  context: () => ({ featuredMediasQueryOptions: featuredMediasQueryOptions() }),
  loader: async ({ context }) => {
    if (context.session) {
      const prefetch = context.queryClient.query(context.featuredMediasQueryOptions).catch(noop)

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
