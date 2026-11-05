import { PAGE_REPORT_STATUSES, type PageReportStatus } from "@taiyomoe/db/constants"
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
  PAGE_REPORTS_PER_PAGE,
  pageReportsQueryOptions,
  useClosePageReport,
} from "@/features/page-reports/api/page-reports"
import { PageReportRow } from "@/features/page-reports/components/page-report-row"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/page-reports")
const STATUS_LABELS: Record<PageReportStatus, () => string> = {
  OPEN: m.page_reports_status_open,
  RESOLVED: m.page_reports_status_resolved,
  DISMISSED: m.page_reports_status_dismissed,
}

export function PageReportsPage() {
  const { status, page } = routeApi.useLoaderDeps()
  const navigate = routeApi.useNavigate()
  const reports = useQuery({
    ...pageReportsQueryOptions(status, page),
    placeholderData: keepPreviousData,
  })
  const close = useClosePageReport()
  const rows = reports.data?.data ?? []

  return (
    <DashboardPage
      actions={
        <Tabs
          onValueChange={(value: PageReportStatus) => {
            void navigate({ search: { status: value === "OPEN" ? undefined : value } })
          }}
          value={status}
        >
          <TabsList aria-label={m.page_reports_status()}>
            {PAGE_REPORT_STATUSES.map((value) => (
              <TabsTab key={value} value={value}>
                {STATUS_LABELS[value]()}
              </TabsTab>
            ))}
          </TabsList>
        </Tabs>
      }
      subtitle={m.page_reports_subtitle()}
      title={m.page_reports_title()}
    >
      {reports.data !== undefined && rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Flag />
            </EmptyMedia>
            <EmptyTitle>{m.page_reports_empty_title()}</EmptyTitle>
            <EmptyDescription>{m.page_reports_empty()}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <ListCard>
            {rows.map((report) => (
              <PageReportRow
                key={report.id}
                onClose={
                  report.status === "OPEN"
                    ? (next) => {
                        close.mutate(
                          { id: report.id, status: next },
                          {
                            onError: (error) => {
                              toastManager.add({
                                title: getErrorMessage(error),
                                type: "error",
                              })
                            },
                          },
                        )
                      }
                    : null
                }
                pending={close.isPending && close.variables.id === report.id}
                report={report}
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
            pageCount={Math.ceil((reports.data?.meta.total ?? 0) / PAGE_REPORTS_PER_PAGE)}
            renderLink={(target) => (
              <Link
                search={(previous) => ({ ...previous, page: target === 1 ? undefined : target })}
                to="/dashboard/page-reports"
              />
            )}
          />
        </>
      )}
    </DashboardPage>
  )
}
