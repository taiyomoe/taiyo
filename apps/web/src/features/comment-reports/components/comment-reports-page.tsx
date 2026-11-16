import * as stylex from "@stylexjs/stylex"
import { CancelCircle, CheckCircle, Flag } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type {
  CommentReportsFilter,
  ReportedComment,
} from "@/features/comment-reports/api/comment-reports"
import type { CommentReportAction } from "@/features/comment-reports/components/comment-report-row"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { FilterChoice, FilterSelect, FilterToolbar } from "@/components/filters/filter-toolbar"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import { BulkBar, BulkDeleteButton } from "@/features/catalog/components/shared/bulk-bar"
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
  COMMENT_REPORTS_PER_PAGE,
  commentReportsQueryOptions,
  useCloseCommentReports,
} from "@/features/comment-reports/api/comment-reports"
import { CommentReportDialog } from "@/features/comment-reports/components/comment-report-dialog"
import { CommentReportRow } from "@/features/comment-reports/components/comment-report-row"
import {
  REPORT_REASON_OPTIONS,
  REPORT_STATUS_OPTIONS,
} from "@/features/comment-reports/lib/report-options"
import { DeleteCommentsDialog } from "@/features/comments/components/manage/delete-comments-dialog"
import { COMMENT_TARGET_OPTIONS } from "@/features/comments/lib/comment-target-options"
import { formatNumber } from "@/features/dashboard/lib/format"
import { getErrorMessage } from "@/lib/errors"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

type CloseStatus = "RESOLVED" | "DISMISSED"
type ReportsDialog =
  | { kind: "reports"; entry: ReportedComment }
  | { kind: "delete"; entries: ReportedComment[]; bulk: boolean }
  | { kind: "close"; status: CloseStatus; entries: ReportedComment[] }

const routeApi = getRouteApi("/dashboard/comment-reports")
// Wide enough for the longest reason, "Sexual or shocking content", in every language.
const styles = stylex.create({
  colReports: { width: "15rem" },
})
const CLOSED_LABELS: Record<CloseStatus, (inputs: { count: number }) => string> = {
  RESOLVED: m.comment_reports_resolved,
  DISMISSED: m.comment_reports_dismissed,
}

export function CommentReportsPage() {
  const { session } = routeApi.useRouteContext()
  const params = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const canDelete = getPermissions(session.user)("comment.delete")
  const filter: CommentReportsFilter = {
    status: params.status ?? "OPEN",
    reason: params.reason,
    target: params.target,
    page: params.page ?? 1,
  }
  const { data, isPlaceholderData } = useQuery(commentReportsQueryOptions(useDeferredValue(filter)))
  const open = filter.status === "OPEN"
  const rows = data?.data ?? []
  const selectable = rows.filter((entry) => open || (canDelete && entry.comment.removal === null))
  const selection = useSelection(selectable.map((entry) => entry.comment.id))
  const selected = selectable.filter((entry) => selection.has(entry.comment.id))
  const live = selected.filter((entry) => entry.comment.removal === null)
  const close = useCloseCommentReports()
  const [dialog, setDialog] = useState<ReportsDialog | null>(null)
  const search = (next: CommentReportsFilter) => ({
    status: next.status === "OPEN" ? undefined : next.status,
    reason: next.reason,
    target: next.target,
    page: next.page === 1 ? undefined : next.page,
  })
  const update = (patch: Partial<CommentReportsFilter>) => {
    void navigate({
      replace: true,
      search: search({ ...filter, ...patch, page: patch.page ?? 1 }),
    })
  }
  const closeReports = (entries: ReportedComment[], status: CloseStatus) =>
    close.mutateAsync(
      { reportIds: entries.map((entry) => entry.reportId), status },
      {
        onSuccess: (result) => {
          toastBulkResult(result, CLOSED_LABELS[status])
        },
      },
    )
  const act = (entry: ReportedComment) => (action: CommentReportAction) => {
    if (action === "reports") {
      setDialog({ kind: "reports", entry })
    } else if (action === "delete") {
      setDialog({ kind: "delete", entries: [entry], bulk: false })
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
    <DashboardPage subtitle={m.comment_reports_subtitle()} title={m.comment_reports_title()}>
      <CatalogTable
        bulkBar={
          <BulkBar count={selection.ids.length} onClear={selection.clear}>
            {open ? (
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
            ) : null}
            {open && live.length === 0 ? (
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
            {canDelete && live.length > 0 ? (
              <BulkDeleteButton
                onClick={() => {
                  setDialog({ kind: "delete", entries: live, bulk: true })
                }}
              />
            ) : null}
          </BulkBar>
        }
        columns={[
          {
            key: "comment",
            label: m.comments_column_comment(),
            skeleton: (
              <SkeletonMediaCell narrow={{ from: "4xl", content: "pills" }} thumb="avatar" />
            ),
          },
          {
            key: "target",
            label: m.comments_column_target(),
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
                  filter.reason === undefined && filter.target === undefined
                    ? m.comment_reports_empty_title()
                    : m.comment_reports_empty_filtered(),
                description:
                  filter.reason === undefined && filter.target === undefined
                    ? m.comment_reports_empty()
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
                pageCount={Math.ceil(data.meta.total / COMMENT_REPORTS_PER_PAGE)}
                renderLink={(page) => (
                  <Link search={search({ ...filter, page })} to="/dashboard/comment-reports" />
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
            <FilterSelect
              allLabel={m.comments_all_targets()}
              label={m.comments_column_target()}
              onChange={(target) => {
                update({ target })
              }}
              options={COMMENT_TARGET_OPTIONS}
              value={filter.target}
            />
          </FilterToolbar>
        }
      >
        {rows.map((entry) => (
          <CommentReportRow
            canDelete={canDelete}
            entry={entry}
            key={entry.comment.id}
            onAction={act(entry)}
            open={open}
            pending={close.isPending && close.variables.reportIds.includes(entry.reportId)}
            selection={data === undefined || selectable.length > 0 ? selection : undefined}
          />
        ))}
      </CatalogTable>
      {dialog?.kind === "reports" ? (
        <CommentReportDialog
          canDelete={canDelete}
          entry={dialog.entry}
          onAction={act(dialog.entry)}
          onClose={() => {
            setDialog(null)
          }}
          status={filter.status}
        />
      ) : null}
      <DeleteCommentsDialog
        comments={dialog?.kind === "delete" ? dialog.entries.map((entry) => entry.comment) : null}
        onClose={() => {
          setDialog(null)
        }}
        onDone={dialog?.kind === "delete" && dialog.bulk ? selection.clear : undefined}
      />
      <ConfirmDialog
        confirmation={
          dialog?.kind === "close"
            ? {
                title:
                  dialog.status === "DISMISSED"
                    ? m.comment_reports_dismiss_title({ count: dialog.entries.length })
                    : m.comment_reports_resolve_title({ count: dialog.entries.length }),
                description:
                  dialog.status === "DISMISSED"
                    ? m.comment_reports_dismiss_description()
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
