import * as stylex from "@stylexjs/stylex"
import { CancelCircle, CheckCircle, Flag } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type {
  ReportedReview,
  ReviewReportsFilter,
} from "@/features/review-reports/api/review-reports"
import type { ReviewReportAction } from "@/features/review-reports/components/review-report-row"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { FilterChoice, FilterSelect, FilterToolbar } from "@/components/filters/filter-toolbar"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import { BulkBar } from "@/features/catalog/components/shared/bulk-bar"
import {
  SkeletonActions,
  SkeletonIconText,
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
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import {
  REPORT_REASON_OPTIONS,
  REPORT_STATUS_OPTIONS,
} from "@/features/comment-reports/lib/report-options"
import { formatNumber } from "@/features/dashboard/lib/format"
import {
  REVIEW_REPORTS_PER_PAGE,
  reviewReportsQueryOptions,
  useCloseReviewReports,
} from "@/features/review-reports/api/review-reports"
import { ReviewReportDialog } from "@/features/review-reports/components/review-report-dialog"
import { ReviewReportRow } from "@/features/review-reports/components/review-report-row"
import { useDeleteReview } from "@/features/reviews/api/reviews"
import { getErrorMessage } from "@/lib/errors"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

type CloseStatus = "RESOLVED" | "DISMISSED"
type ReportsDialog =
  | { kind: "reports"; entry: ReportedReview }
  | { kind: "delete"; entry: ReportedReview }
  | { kind: "close"; status: CloseStatus; entries: ReportedReview[] }

const routeApi = getRouteApi("/dashboard/review-reports")
const styles = stylex.create({
  colReports: { width: "16rem" },
})
const CLOSED_LABELS: Record<CloseStatus, (inputs: { count: number }) => string> = {
  RESOLVED: m.comment_reports_resolved,
  DISMISSED: m.comment_reports_dismissed,
}

export function ReviewReportsPage() {
  const { session } = routeApi.useRouteContext()
  const params = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const canDelete = getPermissions(session.user)("mediaReview.delete")
  const filter: ReviewReportsFilter = {
    status: params.status ?? "OPEN",
    reason: params.reason,
    page: params.page ?? 1,
  }
  const { data, isPlaceholderData } = useQuery(reviewReportsQueryOptions(useDeferredValue(filter)))
  const open = filter.status === "OPEN"
  const rows = data?.data ?? []
  const selectable = open ? rows : []
  const selection = useSelection(selectable.map((entry) => entry.review.id))
  const selected = selectable.filter((entry) => selection.has(entry.review.id))
  const live = selected.filter((entry) => entry.review.deletedAt === null)
  const close = useCloseReviewReports()
  const remove = useDeleteReview()
  const [dialog, setDialog] = useState<ReportsDialog | null>(null)
  const search = (next: ReviewReportsFilter) => ({
    status: next.status === "OPEN" ? undefined : next.status,
    reason: next.reason,
    page: next.page === 1 ? undefined : next.page,
  })
  const update = (patch: Partial<ReviewReportsFilter>) => {
    void navigate({
      replace: true,
      search: search({ ...filter, ...patch, page: patch.page ?? 1 }),
    })
  }
  const closeReports = (entries: ReportedReview[], status: CloseStatus) =>
    close.mutateAsync(
      { reportIds: entries.map((entry) => entry.reportId), status },
      {
        onSuccess: (result) => {
          toastBulkResult(result, CLOSED_LABELS[status])
        },
      },
    )
  const act = (entry: ReportedReview) => (action: ReviewReportAction) => {
    if (action === "reports") {
      setDialog({ kind: "reports", entry })
    } else if (action === "delete") {
      remove.reset()
      setDialog({ kind: "delete", entry })
    } else {
      setDialog(null)
      closeReports([entry], action === "dismiss" ? "DISMISSED" : "RESOLVED").catch(
        (error: unknown) => {
          toastManager.add({ title: getErrorMessage(error), type: "error" })
        },
      )
    }
  }

  return (
    <DashboardPage subtitle={m.review_reports_subtitle()} title={m.review_reports_title()}>
      <CatalogTable
        bulkBar={
          <BulkBar count={selection.ids.length} onClear={selection.clear}>
            <Button
              onClick={() => {
                close.reset()
                setDialog({ kind: "close", status: "DISMISSED", entries: selected })
              }}
              variant="outline"
            >
              <CancelCircle />
              {m.comment_reports_dismiss()}
            </Button>
            {live.length === 0 ? (
              <Button
                onClick={() => {
                  close.reset()
                  setDialog({ kind: "close", status: "RESOLVED", entries: selected })
                }}
                variant="outline"
              >
                <CheckCircle />
                {m.comment_reports_resolve()}
              </Button>
            ) : null}
          </BulkBar>
        }
        columns={[
          {
            key: "review",
            label: m.review_reports_column_review(),
            skeleton: (
              <SkeletonMediaCell narrow={{ from: "4xl", content: "pills" }} thumb="avatar" />
            ),
          },
          {
            key: "media",
            label: m.review_reports_column_media(),
            width: catalogStyles.colWide,
            from: "3xl",
            skeleton: <SkeletonIconText width="7rem" />,
          },
          {
            key: "reports",
            label: m.comment_reports_column_reports(),
            width: styles.colReports,
            from: "4xl",
            skeleton: <SkeletonPill width="8rem" />,
          },
          {
            key: "date",
            label: m.comment_reports_column_last(),
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
                icon: Flag,
                title:
                  filter.reason === undefined
                    ? m.comment_reports_empty_title()
                    : m.review_reports_empty_filtered(),
                description:
                  filter.reason === undefined
                    ? m.review_reports_empty()
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
                pageCount={Math.ceil(data.meta.total / REVIEW_REPORTS_PER_PAGE)}
                renderLink={(page) => (
                  <Link search={search({ ...filter, page })} to="/dashboard/review-reports" />
                )}
              />
            </CatalogFooter>
          )
        }
        loading={data === undefined}
        selection={data === undefined || selectable.length > 0 ? selection : undefined}
        toolbar={
          <FilterToolbar>
            <FilterChoice
              label={m.comment_reports_status()}
              onChange={(status) => {
                update({ status })
              }}
              options={REPORT_STATUS_OPTIONS}
              value={filter.status}
            />
            <FilterSelect
              allLabel={m.comment_reports_all_reasons()}
              label={m.comments_report_reason()}
              onChange={(reason) => {
                update({ reason })
              }}
              options={REPORT_REASON_OPTIONS}
              value={filter.reason}
            />
          </FilterToolbar>
        }
      >
        {rows.map((entry) => (
          <ReviewReportRow
            canDelete={canDelete}
            entry={entry}
            key={entry.review.id}
            onAction={act(entry)}
            open={open}
            pending={close.isPending && close.variables.reportIds.includes(entry.reportId)}
            selection={data === undefined || selectable.length > 0 ? selection : undefined}
          />
        ))}
      </CatalogTable>
      {dialog?.kind === "reports" ? (
        <ReviewReportDialog
          canDelete={canDelete}
          entry={dialog.entry}
          onAction={act(dialog.entry)}
          onClose={() => {
            setDialog(null)
          }}
          status={filter.status}
        />
      ) : null}
      <ConfirmDialog
        confirmation={
          dialog?.kind === "delete"
            ? {
                title: m.reviews_delete_title(),
                description: m.reviews_remove_description(),
                confirmLabel: m.reviews_delete(),
                destructive: true,
                run: () => remove.mutateAsync({ ...dialog.entry.review, moderate: true }),
              }
            : null
        }
        error={remove.isError ? getErrorMessage(remove.error) : null}
        onClose={() => {
          remove.reset()
          setDialog(null)
        }}
        pending={remove.isPending}
      />
      <ConfirmDialog
        confirmation={
          dialog?.kind === "close"
            ? {
                title:
                  dialog.status === "DISMISSED"
                    ? m.review_reports_dismiss_title({ count: dialog.entries.length })
                    : m.review_reports_resolve_title({ count: dialog.entries.length }),
                description:
                  dialog.status === "DISMISSED"
                    ? m.review_reports_dismiss_description()
                    : m.comment_reports_resolve_description(),
                confirmLabel:
                  dialog.status === "DISMISSED"
                    ? m.comment_reports_dismiss()
                    : m.comment_reports_resolve(),
                run: async () => {
                  await closeReports(dialog.entries, dialog.status)
                  selection.clear()
                },
              }
            : null
        }
        error={close.isError ? getErrorMessage(close.error) : null}
        onClose={() => {
          close.reset()
          setDialog(null)
        }}
        pending={close.isPending}
      />
    </DashboardPage>
  )
}
