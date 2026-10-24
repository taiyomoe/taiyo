import { CheckCircle } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { noop, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { DashboardPage, ListCard } from "@/components/dashboard/dashboard-page"
import { SuggestionRow } from "@/components/media-edit/suggestion-row"
import { PagePagination } from "@/components/pagination/page-pagination"
import { getPermissions } from "@/lib/permissions"
import { suggestionQueueQueryOptions, SUGGESTIONS_PER_PAGE } from "@/lib/queries/media-edit"
import { m } from "@/paraglide/messages"

const searchSchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).optional().catch(undefined),
})

export const Route = createFileRoute("/dashboard/suggestions/")({
  head: () => ({ meta: [{ title: m.suggestions_queue_meta_title() }] }),
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("mediaSuggestion.review")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: async ({ context, deps: { page } }) => {
    const prefetch = context.queryClient.query(suggestionQueueQueryOptions(page)).catch(noop)

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: function SuggestionQueue() {
    const { page } = Route.useLoaderDeps()
    const { data } = useSuspenseQuery(suggestionQueueQueryOptions(page))
    const navigate = useNavigate({ from: "/dashboard/suggestions/" })

    return (
      <DashboardPage subtitle={m.suggestions_queue_subtitle()} title={m.suggestions_queue_title()}>
        {data.data.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CheckCircle />
              </EmptyMedia>
              <EmptyTitle>{m.review_empty_title()}</EmptyTitle>
              <EmptyDescription>{m.suggestions_queue_empty()}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <ListCard>
              {data.data.map((suggestion) => (
                <SuggestionRow
                  actions={
                    <Button
                      render={
                        <Link
                          params={{ suggestionId: suggestion.id }}
                          to="/dashboard/suggestions/$suggestionId"
                        />
                      }
                      size="sm"
                    >
                      {m.review_chapter()}
                    </Button>
                  }
                  key={suggestion.id}
                  showAuthor
                  suggestion={suggestion}
                />
              ))}
            </ListCard>
            <PagePagination
              onJump={(target) => {
                void navigate({ search: { page: target === 1 ? undefined : target } })
              }}
              page={page}
              pageCount={Math.ceil(data.meta.total / SUGGESTIONS_PER_PAGE)}
              renderLink={(target) => (
                <Link
                  search={{ page: target === 1 ? undefined : target }}
                  to="/dashboard/suggestions"
                />
              )}
            />
          </>
        )}
      </DashboardPage>
    )
  },
})
