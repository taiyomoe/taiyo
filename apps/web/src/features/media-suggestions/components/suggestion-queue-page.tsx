import { CancelCircle, CheckCircle } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type { SuggestionQueueFilter } from "@/features/media-suggestions/api/media-suggestions"
import type { SuggestionReview } from "@/features/media-suggestions/components/review-suggestions-dialog"
import { FilterSearch, FilterToolbar } from "@/components/filters/filter-toolbar"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import { BulkBar } from "@/features/catalog/components/shared/bulk-bar"
import {
  SkeletonActions,
  SkeletonMediaCell,
  SkeletonPill,
  SkeletonText,
  SkeletonUsers,
} from "@/features/catalog/components/shared/catalog-skeletons"
import {
  CatalogFooter,
  CatalogTable,
  VisuallyHidden,
} from "@/features/catalog/components/shared/catalog-table"
import { useSelection } from "@/features/catalog/hooks/use-selection"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { formatNumber } from "@/features/dashboard/lib/format"
import {
  suggestionQueueQueryOptions,
  SUGGESTIONS_PER_PAGE,
} from "@/features/media-suggestions/api/media-suggestions"
import { QueueSuggestionRow } from "@/features/media-suggestions/components/queue-suggestion-row"
import { ReviewSuggestionsDialog } from "@/features/media-suggestions/components/review-suggestions-dialog"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/suggestions/")

export function SuggestionQueuePage() {
  const params = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const filter: SuggestionQueueFilter = { search: params.q, page: params.page ?? 1 }
  const { data, isPlaceholderData } = useQuery(
    suggestionQueueQueryOptions(useDeferredValue(filter)),
  )
  const selection = useSelection(data?.data.map((suggestion) => suggestion.id) ?? [])
  const [review, setReview] = useState<SuggestionReview | null>(null)
  const bulk = (decision: SuggestionReview["decision"]) => () => {
    setReview({
      decision,
      suggestions: data?.data.filter((suggestion) => selection.has(suggestion.id)) ?? [],
      bulk: true,
    })
  }
  const search = (next: SuggestionQueueFilter) => ({
    q: next.search,
    page: next.page === 1 ? undefined : next.page,
  })
  const update = (patch: Partial<SuggestionQueueFilter>) => {
    void navigate({
      replace: true,
      search: search({ ...filter, ...patch, page: patch.page ?? 1 }),
    })
  }

  return (
    <DashboardPage subtitle={m.suggestions_queue_subtitle()} title={m.suggestions_queue_title()}>
      <CatalogTable
        bulkBar={
          <BulkBar count={selection.ids.length} onClear={selection.clear}>
            <Button onClick={bulk("accept")} variant="outline">
              <CheckCircle />
              {m.suggestions_accept()}
            </Button>
            <Button onClick={bulk("reject")} variant="destructive-outline">
              <CancelCircle />
              {m.suggestions_reject()}
            </Button>
          </BulkBar>
        }
        columns={[
          {
            key: "media",
            label: m.catalog_column_media(),
            skeleton: (
              <SkeletonMediaCell narrow={{ from: "4xl", content: "pills" }} thumb="cover" />
            ),
          },
          {
            key: "fields",
            label: m.suggestions_column_fields(),
            width: catalogStyles.colTarget,
            from: "3xl",
            skeleton: <SkeletonPill width="6rem" />,
          },
          {
            key: "author",
            label: m.suggestions_column_author(),
            width: catalogStyles.colWide,
            from: "4xl",
            skeleton: <SkeletonUsers />,
          },
          {
            key: "date",
            label: m.suggestion_suggested(),
            width: catalogStyles.colMedium,
            from: "4xl",
            skeleton: <SkeletonText width="5.5rem" />,
          },
          {
            key: "actions",
            label: <VisuallyHidden>{m.catalog_column_actions()}</VisuallyHidden>,
            width: catalogStyles.colActions,
            skeleton: <SkeletonActions />,
          },
        ]}
        empty={
          data?.data.length === 0
            ? {
                icon: CheckCircle,
                title:
                  filter.search === undefined
                    ? m.review_empty_title()
                    : m.suggestions_empty_filtered(),
                description:
                  filter.search === undefined
                    ? m.suggestions_queue_empty()
                    : m.catalog_empty_description(),
              }
            : null
        }
        fetching={isPlaceholderData}
        footer={
          data === undefined ? null : (
            <CatalogFooter total={m.catalog_results({ count: formatNumber(data.meta.total) })}>
              <PagePagination
                fit="container"
                onJump={(page) => {
                  update({ page })
                }}
                page={filter.page}
                pageCount={Math.ceil(data.meta.total / SUGGESTIONS_PER_PAGE)}
                renderLink={(page) => (
                  <Link search={search({ ...filter, page })} to="/dashboard/suggestions" />
                )}
              />
            </CatalogFooter>
          )
        }
        loading={data === undefined}
        selection={selection}
        toolbar={
          <FilterToolbar>
            <FilterSearch
              label={m.suggestions_queue_search()}
              onChange={(next) => {
                update({ search: next })
              }}
              value={filter.search}
            />
          </FilterToolbar>
        }
      >
        {data?.data.map((suggestion) => (
          <QueueSuggestionRow
            key={suggestion.id}
            onAccept={() => {
              setReview({ decision: "accept", suggestions: [suggestion], bulk: false })
            }}
            onReject={() => {
              setReview({ decision: "reject", suggestions: [suggestion], bulk: false })
            }}
            selection={selection}
            suggestion={suggestion}
          />
        ))}
      </CatalogTable>
      <ReviewSuggestionsDialog
        onBulkDone={selection.clear}
        onClose={() => {
          setReview(null)
        }}
        review={review}
      />
    </DashboardPage>
  )
}
