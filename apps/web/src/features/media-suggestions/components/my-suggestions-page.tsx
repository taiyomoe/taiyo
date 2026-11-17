import { Edit, Undo } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type {
  MediaSuggestion,
  MySuggestionsFilter,
} from "@/features/media-suggestions/api/media-suggestions"
import { FilterSearch, FilterSelect, FilterToolbar } from "@/components/filters/filter-toolbar"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import { BulkBar } from "@/features/catalog/components/shared/bulk-bar"
import {
  SkeletonActions,
  SkeletonMediaCell,
  SkeletonPill,
  SkeletonText,
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
  mySuggestionsQueryOptions,
  SUGGESTIONS_PER_PAGE,
} from "@/features/media-suggestions/api/media-suggestions"
import { MySuggestionRow } from "@/features/media-suggestions/components/my-suggestion-row"
import { WithdrawSuggestionsDialog } from "@/features/media-suggestions/components/withdraw-suggestions-dialog"
import { SUGGESTION_STATUS_OPTIONS } from "@/features/media-suggestions/lib/suggestion-status"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/my-suggestions")

export function MySuggestionsPage() {
  const params = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const filter: MySuggestionsFilter = {
    search: params.q,
    status: params.status,
    page: params.page ?? 1,
  }
  const { data, isPlaceholderData } = useQuery(mySuggestionsQueryOptions(useDeferredValue(filter)))
  const pending = data?.data.filter((suggestion) => suggestion.status === "PENDING") ?? []
  const selection = useSelection(pending.map((suggestion) => suggestion.id))
  const selectable = data === undefined || pending.length > 0 ? selection : undefined
  const [withdrawing, setWithdrawing] = useState<{
    suggestions: MediaSuggestion[]
    bulk: boolean
  } | null>(null)
  const filtered = filter.search !== undefined || filter.status !== undefined
  const search = (next: MySuggestionsFilter) => ({
    q: next.search,
    status: next.status,
    page: next.page === 1 ? undefined : next.page,
  })
  const update = (patch: Partial<MySuggestionsFilter>) => {
    void navigate({
      replace: true,
      search: search({ ...filter, ...patch, page: patch.page ?? 1 }),
    })
  }

  return (
    <DashboardPage subtitle={m.my_suggestions_subtitle()} title={m.dashboard_nav_my_suggestions()}>
      <CatalogTable
        bulkBar={
          <BulkBar count={selection.ids.length} onClear={selection.clear}>
            <Button
              onClick={() => {
                setWithdrawing({
                  suggestions: pending.filter((suggestion) => selection.has(suggestion.id)),
                  bulk: true,
                })
              }}
              variant="destructive-outline"
            >
              <Undo />
              {m.my_suggestions_withdraw()}
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
            key: "status",
            label: m.suggestions_column_status(),
            width: catalogStyles.colMedium,
            from: "3xl",
            skeleton: <SkeletonPill width="5rem" />,
          },
          {
            key: "fields",
            label: m.suggestions_column_fields(),
            width: catalogStyles.colTarget,
            from: "4xl",
            skeleton: <SkeletonPill width="6rem" />,
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
                icon: Edit,
                title: filtered ? m.suggestions_empty_filtered() : m.my_suggestions_empty_title(),
                description: filtered
                  ? m.catalog_empty_description()
                  : m.my_suggestions_empty_description(),
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
                  <Link search={search({ ...filter, page })} to="/dashboard/my-suggestions" />
                )}
              />
            </CatalogFooter>
          )
        }
        loading={data === undefined}
        selection={selectable}
        toolbar={
          <FilterToolbar>
            <FilterSearch
              label={m.catalog_media_search()}
              onChange={(next) => {
                update({ search: next })
              }}
              value={filter.search}
            />
            <FilterSelect
              allLabel={m.catalog_all_statuses()}
              label={m.suggestions_column_status()}
              onChange={(status) => {
                update({ status })
              }}
              options={SUGGESTION_STATUS_OPTIONS}
              value={filter.status}
            />
          </FilterToolbar>
        }
      >
        {data?.data.map((suggestion) => (
          <MySuggestionRow
            key={suggestion.id}
            onWithdraw={() => {
              setWithdrawing({ suggestions: [suggestion], bulk: false })
            }}
            selection={selectable}
            suggestion={suggestion}
          />
        ))}
      </CatalogTable>
      <WithdrawSuggestionsDialog
        onClose={() => {
          setWithdrawing(null)
        }}
        onDone={withdrawing?.bulk === true ? selection.clear : undefined}
        suggestions={withdrawing?.suggestions ?? null}
      />
    </DashboardPage>
  )
}
