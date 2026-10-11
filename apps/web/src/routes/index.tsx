import { createFileRoute } from "@tanstack/react-router"

import { HomePage } from "@/components/home/home-page"
import { LandingPage } from "@/components/landing/landing-page"
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
  component: Index,
})

function Index() {
  const { session } = Route.useRouteContext()

  return session ? <HomePage user={session.user} /> : <LandingPage />
}
