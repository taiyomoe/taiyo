import { CheckCircle } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router"
import { DashboardPage, ListCard } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import {
  suggestionQueueQueryOptions,
  SUGGESTIONS_PER_PAGE,
} from "@/features/media-suggestions/api/media-suggestions"
import { SuggestionRow } from "@/features/media-suggestions/components/suggestion-row"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/suggestions/")

export function SuggestionQueuePage() {
  const { page } = routeApi.useLoaderDeps()
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
}
