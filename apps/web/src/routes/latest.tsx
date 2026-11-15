import { noop } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { latestMediaUpdatesQueryOptions } from "@/features/chapters/api/chapters"
import { LatestPage } from "@/features/latest/components/latest-page"
import { LATEST_MEDIAS_PER_PAGE } from "@/features/latest/lib/pagination"
import { getContentRatings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const FIRST_PAGE = 1
const searchSchema = z.object({
  page: z.coerce.number().int().min(FIRST_PAGE).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/latest")({
  head: () => ({ meta: [{ title: m.latest_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/auth/sign-in" })
    }

    return { session: context.session }
  },
  loaderDeps: ({ search: { page } }) => ({ page: page ?? FIRST_PAGE }),
  loader: async ({ context, deps: { page } }) => {
    const prefetch = context.queryClient
      .query(
        latestMediaUpdatesQueryOptions(
          getContentRatings(context.session),
          page,
          LATEST_MEDIAS_PER_PAGE,
        ),
      )
      .catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: LatestPage,
})
