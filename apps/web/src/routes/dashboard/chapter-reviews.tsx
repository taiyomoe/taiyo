import { noop } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"
import { ChapterReviewPage } from "@/components/submissions/chapter-review-page"
import { getPermissions } from "@/lib/permissions"
import { reviewQueueQueryOptions } from "@/lib/queries/submissions"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/chapter-reviews")({
  head: () => ({ meta: [{ title: m.review_chapters_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("chapter.review")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: async ({ context, deps: { page } }) => {
    const prefetch = context.queryClient.query(reviewQueueQueryOptions(page)).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: ChapterReviews,
})

function ChapterReviews() {
  const { session } = Route.useRouteContext()
  const { page } = Route.useLoaderDeps()

  return <ChapterReviewPage page={page} user={session.user} />
}
