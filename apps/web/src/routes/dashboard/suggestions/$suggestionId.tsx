import { noop } from "@tanstack/react-query"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { isNotFoundError } from "@/components/boundaries/not-found-page"
import { suggestionQueryOptions } from "@/features/media-suggestions/api/media-suggestions"
import { SuggestionNotFound } from "@/features/media-suggestions/components/suggestion-review/suggestion-not-found"
import { SuggestionReviewPage } from "@/features/media-suggestions/components/suggestion-review/suggestion-review-page"
import { m } from "@/paraglide/messages"

export const Route = createFileRoute("/dashboard/suggestions/$suggestionId")({
  head: () => ({ meta: [{ title: m.suggestion_meta_title() }] }),
  loader: async ({ context, params: { suggestionId } }) => {
    const suggestion = context.queryClient.query(suggestionQueryOptions(suggestionId))

    if (import.meta.env.SSR) {
      await suggestion.catch(noop)
    }

    await suggestion.catch((error: unknown) => {
      if (isNotFoundError(error, "MEDIA_SUGGESTION_NOT_FOUND")) {
        throw notFound()
      }
    })
  },
  component: SuggestionReviewPage,
  notFoundComponent: SuggestionNotFound,
})
