import { noop } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { mySuggestionsQueryOptions } from "@/features/media-suggestions/api/media-suggestions"
import { MySuggestionsPage } from "@/features/media-suggestions/components/my-suggestions-page"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/my-suggestions")({
  head: () => ({ meta: [{ title: m.my_suggestions_meta_title() }] }),
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: async ({ context, deps: { page } }) => {
    const prefetch = context.queryClient.query(mySuggestionsQueryOptions(page)).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: MySuggestionsPage,
})
