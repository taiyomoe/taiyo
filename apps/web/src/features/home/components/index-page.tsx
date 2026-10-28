import { getRouteApi } from "@tanstack/react-router"
import { HomePage } from "@/features/home/components/home-page"
import { LandingPage } from "@/features/landing/components/landing-page"

const routeApi = getRouteApi("/")

export function IndexPage() {
  const { session } = routeApi.useRouteContext()

  return session ? <HomePage user={session.user} /> : <LandingPage />
}
