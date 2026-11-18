import { noop } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { prefetchRanking } from "@/features/rankings/api/rankings"
import { RankingsPage } from "@/features/rankings/components/rankings-page"
import { RANKING_CATEGORIES, RANKING_PERIODS } from "@/features/rankings/lib/rankings"
import { getContentRatings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  category: z.enum(RANKING_CATEGORIES).optional().catch(undefined),
  period: z.enum(RANKING_PERIODS).optional().catch(undefined),
})

export const Route = createFileRoute("/rankings")({
  head: () => ({ meta: [{ title: m.rankings_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context, location }) => {
    if (!context.session) {
      throw redirect({ to: "/auth/sign-in", search: { redirect: location.href } })
    }

    return { session: context.session }
  },
  loaderDeps: ({ search }) => ({
    category: search.category ?? "readers",
    period: search.period ?? "week",
  }),
  loader: async ({ context, deps }) => {
    const prefetch = prefetchRanking(context.queryClient, deps, {
      viewerId: context.session.user.id,
      contentRatings: getContentRatings(context.session),
    }).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: RankingsPage,
})
