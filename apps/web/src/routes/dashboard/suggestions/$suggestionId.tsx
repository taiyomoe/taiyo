import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { suggestionQueryOptions } from "@/features/media-suggestions/api/media-suggestions"
import { SuggestionReviewPage } from "@/features/media-suggestions/components/suggestion-review/suggestion-review-page"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/dashboard/suggestions/$suggestionId")({
  head: () => ({ meta: [{ title: m.suggestion_meta_title() }] }),
  loader: async ({ context, params: { suggestionId } }) => {
    const prefetch = context.queryClient.query(suggestionQueryOptions(suggestionId)).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: SuggestionReviewPage,
})
