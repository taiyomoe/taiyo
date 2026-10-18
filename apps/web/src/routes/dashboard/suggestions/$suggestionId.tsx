import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { SuggestionReviewPage } from "@/components/media-edit/suggestion-review-page"
import { suggestionQueryOptions } from "@/lib/queries/media-edit"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/dashboard/suggestions/$suggestionId")({
  head: () => ({ meta: [{ title: m.suggestion_meta_title() }] }),
  loader: async ({ context, params: { suggestionId } }) => {
    const prefetch = context.queryClient.query(suggestionQueryOptions(suggestionId)).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: Suggestion,
})

function Suggestion() {
  const { session } = Route.useRouteContext()
  const { suggestionId } = Route.useParams()

  return <SuggestionReviewPage suggestionId={suggestionId} user={session.user} />
}
