import { Edit } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { noop, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { DashboardPage, ListCard } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import {
  mySuggestionsQueryOptions,
  SUGGESTIONS_PER_PAGE,
} from "@/features/media-suggestions/api/media-suggestions"
import { SuggestionRow } from "@/features/media-suggestions/components/suggestion-row"
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
  component: function MySuggestions() {
    const { page } = Route.useLoaderDeps()
    const { data } = useSuspenseQuery(mySuggestionsQueryOptions(page))
    const navigate = useNavigate({ from: "/dashboard/my-suggestions" })

    return (
      <DashboardPage
        subtitle={m.my_suggestions_subtitle()}
        title={m.dashboard_nav_my_suggestions()}
      >
        {data.data.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Edit />
              </EmptyMedia>
              <EmptyTitle>{m.my_suggestions_empty_title()}</EmptyTitle>
              <EmptyDescription>{m.my_suggestions_empty_description()}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <ListCard>
              {data.data.map((suggestion) => (
                <SuggestionRow
                  actions={
                    suggestion.status === "PENDING" ? (
                      <Button
                        render={
                          <Link
                            params={{ mediaId: suggestion.media.id }}
                            to="/media/$mediaId/edit"
                          />
                        }
                        size="sm"
                        variant="ghost"
                      >
                        {m.my_suggestions_edit()}
                      </Button>
                    ) : (
                      <Button
                        render={
                          <Link
                            params={{ suggestionId: suggestion.id }}
                            to="/dashboard/suggestions/$suggestionId"
                          />
                        }
                        size="sm"
                        variant="ghost"
                      >
                        {m.my_suggestions_details()}
                      </Button>
                    )
                  }
                  key={suggestion.id}
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
                  to="/dashboard/my-suggestions"
                />
              )}
            />
          </>
        )}
      </DashboardPage>
    )
  },
})
