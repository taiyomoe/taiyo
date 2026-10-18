import { CheckCircle, Edit } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { DashboardPage, ListCard } from "@/components/dashboard/dashboard-page"
import { SuggestionRow } from "@/components/media-edit/suggestion-row"
import { PagePagination } from "@/components/pagination/page-pagination"
import {
  mySuggestionsQueryOptions,
  SUGGESTIONS_PER_PAGE,
  suggestionQueueQueryOptions,
} from "@/lib/queries/media-edit"
import { m } from "@/paraglide/messages"

export function SuggestionQueuePage({ page }: { page: number }) {
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

export function MySuggestionsPage({ page }: { page: number }) {
  const { data } = useSuspenseQuery(mySuggestionsQueryOptions(page))
  const navigate = useNavigate({ from: "/dashboard/my-suggestions" })

  return (
    <DashboardPage subtitle={m.my_suggestions_subtitle()} title={m.dashboard_nav_my_suggestions()}>
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
                        <Link params={{ mediaId: suggestion.media.id }} to="/media/$mediaId/edit" />
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
}
