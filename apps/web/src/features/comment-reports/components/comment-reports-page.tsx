import { COMMENT_REPORT_STATUSES, type CommentReportStatus } from "@taiyomoe/db/constants"
import { Flag } from "@taiyomoe/ui/components/icons"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { Tabs, TabsList, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { DashboardPage, ListCard } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import {
  COMMENT_REPORTS_PER_PAGE,
  commentReportsQueryOptions,
  useCloseCommentReport,
  useModerateDeleteComment,
} from "@/features/comment-reports/api/comment-reports"
import { CommentReportRow } from "@/features/comment-reports/components/comment-report-row"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/comment-reports")
const STATUS_LABELS: Record<CommentReportStatus, () => string> = {
  OPEN: m.comment_reports_status_open,
  RESOLVED: m.comment_reports_status_resolved,
  DISMISSED: m.comment_reports_status_dismissed,
}
const showError = (error: unknown) => {
  toastManager.add({ title: getErrorMessage(error), type: "error" })
}

export function CommentReportsPage() {
  const { status, page } = routeApi.useLoaderDeps()
  const navigate = routeApi.useNavigate()
  const reports = useQuery({
    ...commentReportsQueryOptions(status, page),
    placeholderData: keepPreviousData,
  })
  const close = useCloseCommentReport()
  const remove = useModerateDeleteComment()
  const rows = reports.data?.data ?? []

  return (
    <DashboardPage
      actions={
        <Tabs
          onValueChange={(value: CommentReportStatus) => {
            void navigate({ search: { status: value === "OPEN" ? undefined : value } })
          }}
          value={status}
        >
          <TabsList aria-label={m.comment_reports_status()}>
            {COMMENT_REPORT_STATUSES.map((value) => (
              <TabsTab key={value} value={value}>
                {STATUS_LABELS[value]()}
              </TabsTab>
            ))}
          </TabsList>
        </Tabs>
      }
      subtitle={m.comment_reports_subtitle()}
      title={m.comment_reports_title()}
    >
      {reports.data !== undefined && rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Flag />
            </EmptyMedia>
            <EmptyTitle>{m.comment_reports_empty_title()}</EmptyTitle>
            <EmptyDescription>{m.comment_reports_empty()}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <ListCard>
            {rows.map((entry) => (
              <CommentReportRow
                key={entry.comment.id}
                entry={entry}
                onClose={
                  status === "OPEN"
                    ? (next) => {
                        close.mutate({ id: entry.reportId, status: next }, { onError: showError })
                      }
                    : null
                }
                onDelete={
                  entry.comment.removal === null
                    ? () => {
                        remove.mutate(entry.comment.id, { onError: showError })
                      }
                    : null
                }
                pending={
                  (close.isPending && close.variables.id === entry.reportId) ||
                  (remove.isPending && remove.variables === entry.comment.id)
                }
              />
            ))}
          </ListCard>
          <PagePagination
            onJump={(target) => {
              void navigate({
                search: (previous) => ({ ...previous, page: target === 1 ? undefined : target }),
              })
            }}
            page={page}
            pageCount={Math.ceil((reports.data?.meta.total ?? 0) / COMMENT_REPORTS_PER_PAGE)}
            renderLink={(target) => (
              <Link
                from="/dashboard/comment-reports"
                search={(previous) => ({ ...previous, page: target === 1 ? undefined : target })}
                to="/dashboard/comment-reports"
              />
            )}
          />
        </>
      )}
    </DashboardPage>
  )
}
