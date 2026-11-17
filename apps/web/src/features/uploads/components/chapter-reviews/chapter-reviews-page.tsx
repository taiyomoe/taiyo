import { CancelCircle, CheckCircle } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type { ChapterSubmission, ReviewQueueFilter } from "@/features/uploads/api/submissions"
import type { ReviewDialogKind } from "@/features/uploads/components/chapter-reviews/review-queue-row"
import { SUPPORTED_LANGUAGE_OPTIONS } from "@/components/fields/language-options"
import { FilterSearch, FilterSelect, FilterToolbar } from "@/components/filters/filter-toolbar"
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
import { reviewQueueQueryOptions, SUBMISSIONS_PER_PAGE } from "@/features/uploads/api/submissions"
import { ApproveChaptersDialog } from "@/features/uploads/components/chapter-reviews/approve-chapters-dialog"
import { RejectChaptersDialog } from "@/features/uploads/components/chapter-reviews/reject-chapters-dialog"
import { ReviewDialog } from "@/features/uploads/components/chapter-reviews/review-dialog"
import { ReviewQueueRow } from "@/features/uploads/components/chapter-reviews/review-queue-row"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/chapter-reviews")

export function ChapterReviewsPage() {
  const params = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const filter: ReviewQueueFilter = {
    search: params.q,
    language: params.language,
    page: params.page ?? 1,
  }
  const { data, isPlaceholderData } = useQuery(reviewQueueQueryOptions(useDeferredValue(filter)))
  const selection = useSelection(data?.data.map((submission) => submission.id) ?? [])
  const [dialog, setDialog] = useState<{
    kind: ReviewDialogKind
    submissions: ChapterSubmission[]
    bulk: boolean
  } | null>(null)
  const pick = (kind: ReviewDialogKind) => (dialog?.kind === kind ? dialog.submissions : null)
  const bulk = (kind: ReviewDialogKind) => () => {
    setDialog({
      kind,
      submissions: data?.data.filter((submission) => selection.has(submission.id)) ?? [],
      bulk: true,
    })
  }
  const close = () => {
    setDialog(null)
  }
  const onDone = dialog?.bulk === true ? selection.clear : undefined
  const empty =
    filter.search === undefined && filter.language === undefined
      ? {
          icon: CheckCircle,
          title: m.review_empty_title(),
          description: m.review_chapters_empty(),
        }
      : {
          icon: CheckCircle,
          title: m.catalog_chapter_empty_title(),
          description: m.catalog_empty_description(),
        }
  const search = (next: ReviewQueueFilter) => ({
    q: next.search,
    language: next.language,
    page: next.page === 1 ? undefined : next.page,
  })
  const update = (patch: Partial<ReviewQueueFilter>) => {
    void navigate({
      replace: true,
      search: search({ ...filter, ...patch, page: patch.page ?? 1 }),
    })
  }

  return (
    <DashboardPage subtitle={m.review_chapters_subtitle()} title={m.review_chapters_title()}>
      <CatalogTable
        bulkBar={
          <BulkBar count={selection.ids.length} onClear={selection.clear}>
            <Button onClick={bulk("approve")} variant="outline">
              <CheckCircle />
              {m.review_approve()}
            </Button>
            <Button onClick={bulk("reject")} variant="destructive-outline">
              <CancelCircle />
              {m.review_reject()}
            </Button>
          </BulkBar>
        }
        columns={[
          {
            key: "chapter",
            label: m.catalog_column_chapter(),
            skeleton: (
              <SkeletonMediaCell narrow={{ from: "4xl", content: "pills" }} thumb="cover" />
            ),
          },
          {
            key: "language",
            label: m.catalog_column_language(),
            width: catalogStyles.colNarrow,
            from: "3xl",
            skeleton: <SkeletonPill width="3.75rem" />,
          },
          {
            key: "credits",
            label: m.catalog_column_credits(),
            width: catalogStyles.colWide,
            from: "3xl",
            skeleton: <SkeletonUsers count={2} />,
          },
          {
            key: "date",
            label: m.submissions_column_submitted(),
            width: catalogStyles.colWide,
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
        empty={data?.data.length === 0 ? empty : null}
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
                pageCount={Math.ceil(data.meta.total / SUBMISSIONS_PER_PAGE)}
                renderLink={(page) => (
                  <Link search={search({ ...filter, page })} to="/dashboard/chapter-reviews" />
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
              label={m.catalog_chapter_search()}
              onChange={(next) => {
                update({ search: next })
              }}
              value={filter.search}
            />
            <FilterSelect
              allLabel={m.catalog_all_languages()}
              label={m.upload_language()}
              onChange={(language) => {
                update({ language })
              }}
              options={SUPPORTED_LANGUAGE_OPTIONS}
              value={filter.language}
            />
          </FilterToolbar>
        }
      >
        {data?.data.map((submission) => (
          <ReviewQueueRow
            key={submission.id}
            onDialog={(kind) => {
              setDialog({ kind, submissions: [submission], bulk: false })
            }}
            selection={selection}
            submission={submission}
          />
        ))}
      </CatalogTable>
      <ReviewDialog onClose={close} submission={pick("review")?.[0] ?? null} />
      <ApproveChaptersDialog onClose={close} onDone={onDone} submissions={pick("approve")} />
      <RejectChaptersDialog onClose={close} onDone={onDone} submissions={pick("reject")} />
    </DashboardPage>
  )
}
