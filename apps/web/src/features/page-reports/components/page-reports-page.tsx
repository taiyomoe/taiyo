import { CancelCircle, CheckCircle, Flag } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type { CatalogColumn } from "@/features/catalog/components/shared/catalog-table"
import type { PageReport, PageReportsFilter } from "@/features/page-reports/api/page-reports"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
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
import {
  PAGE_REPORTS_PER_PAGE,
  pageReportsQueryOptions,
  useClosePageReports,
} from "@/features/page-reports/api/page-reports"
import { PageReportDialog } from "@/features/page-reports/components/page-report-dialog"
import { PageReportRow } from "@/features/page-reports/components/page-report-row"
import {
  REPORT_REASON_OPTIONS,
  REPORT_STATUS_OPTIONS,
} from "@/features/page-reports/lib/report-reasons"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

type Closing = "RESOLVED" | "DISMISSED"

const routeApi = getRouteApi("/dashboard/page-reports")

export function PageReportsPage() {
  const params = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const filter: PageReportsFilter = {
    status: params.status === "ALL" ? undefined : (params.status ?? "OPEN"),
    reason: params.reason,
    search: params.q,
    page: params.page ?? 1,
  }
  const { data, isPlaceholderData } = useQuery(pageReportsQueryOptions(useDeferredValue(filter)))
  const close = useClosePageReports()
  const [details, setDetails] = useState<PageReport | null>(null)
  const [bulk, setBulk] = useState<Closing | null>(null)
  const queue = filter.status === "OPEN"
  const selection = useSelection(data?.data.map((report) => report.id) ?? [])
  const run = (reportIds: string[], status: Closing, onDone?: () => void) =>
    close.mutateAsync(
      { reportIds, status },
      {
        onSuccess: (result) => {
          toastManager.add({
            title: m.page_reports_bulk_closed({ count: formatNumber(result.closed) }),
            type: result.skipped.length > 0 ? "warning" : "success",
            ...(result.skipped.length === 0
              ? {}
              : { description: m.page_reports_bulk_skipped({ count: result.skipped.length }) }),
          })
          onDone?.()
        },
        onError: (error) => {
          toastManager.add({ title: getErrorMessage(error), type: "error" })
        },
      },
    )
  const search = (next: PageReportsFilter) => ({
    q: next.search,
    reason: next.reason,
    status: next.status === "OPEN" ? undefined : (next.status ?? ("ALL" as const)),
    page: next.page === 1 ? undefined : next.page,
  })
  const update = (patch: Partial<PageReportsFilter>) => {
    void navigate({
      replace: true,
      search: search({ ...filter, ...patch, page: patch.page ?? 1 }),
    })
  }
  const columns: CatalogColumn[] = [
    {
      key: "page",
      label: m.page_reports_column_page(),
      skeleton: <SkeletonMediaCell narrow={{ from: "4xl", content: "pills" }} thumb="cover" />,
    },
    {
      key: "report",
      label: m.page_reports_column_report(),
      width: catalogStyles.colWide,
      from: "3xl",
      skeleton: <SkeletonPill width="6.5rem" />,
    },
    {
      key: "reporter",
      label: m.page_reports_column_reporter(),
      width: catalogStyles.colWide,
      from: "4xl",
      skeleton: <SkeletonUsers />,
    },
    ...(queue
      ? []
      : [
          {
            key: "status",
            label: m.media_info_status(),
            width: catalogStyles.colMedium,
            from: "4xl" as const,
            skeleton: <SkeletonPill />,
          },
        ]),
    {
      key: "date",
      label: m.page_reports_column_reported(),
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
  ]

  return (
    <DashboardPage subtitle={m.page_reports_subtitle()} title={m.page_reports_title()}>
      <CatalogTable
        bulkBar={
          <BulkBar count={selection.ids.length} onClear={selection.clear}>
            <Button
              onClick={() => {
                setBulk("RESOLVED")
              }}
              variant="outline"
            >
              <CheckCircle />
              {m.page_reports_mark_resolved()}
            </Button>
            <Button
              onClick={() => {
                setBulk("DISMISSED")
              }}
              variant="outline"
            >
              <CancelCircle />
              {m.page_reports_dismiss()}
            </Button>
          </BulkBar>
        }
        columns={columns}
        empty={
          data?.data.length === 0
            ? {
                icon: Flag,
                title: m.page_reports_empty_title(),
                description:
                  filter.search === undefined && filter.reason === undefined
                    ? m.page_reports_empty()
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
                pageCount={Math.ceil(data.meta.total / PAGE_REPORTS_PER_PAGE)}
                renderLink={(page) => (
                  <Link search={search({ ...filter, page })} to="/dashboard/page-reports" />
                )}
              />
            </CatalogFooter>
          )
        }
        loading={data === undefined}
        selection={queue ? selection : undefined}
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
              allLabel={m.catalog_all_statuses()}
              label={m.page_reports_status()}
              onChange={(status) => {
                update({ status })
              }}
              options={REPORT_STATUS_OPTIONS}
              value={filter.status}
            />
            <FilterSelect
              allLabel={m.page_reports_all_reasons()}
              label={m.reader_report_reason()}
              onChange={(reason) => {
                update({ reason })
              }}
              options={REPORT_REASON_OPTIONS}
              value={filter.reason}
            />
          </FilterToolbar>
        }
      >
        {data?.data.map((report) => (
          <PageReportRow
            key={report.id}
            onCloseReport={(status) => {
              void run([report.id], status).catch(() => {})
            }}
            onDetails={() => {
              setDetails(report)
            }}
            pending={close.isPending && close.variables.reportIds.includes(report.id)}
            report={report}
            selection={queue ? selection : undefined}
            showStatus={!queue}
          />
        ))}
      </CatalogTable>
      <PageReportDialog
        onClose={() => {
          setDetails(null)
        }}
        onCloseReport={(status) => {
          if (details !== null) {
            void run([details.id], status, () => {
              setDetails(null)
            }).catch(() => {})
          }
        }}
        pending={close.isPending}
        report={details}
      />
      <ConfirmDialog
        confirmation={
          bulk === null
            ? null
            : {
                title:
                  bulk === "RESOLVED"
                    ? m.page_reports_resolve_title({ count: selection.ids.length })
                    : m.page_reports_dismiss_title({ count: selection.ids.length }),
                description: m.page_reports_close_description(),
                confirmLabel:
                  bulk === "RESOLVED" ? m.page_reports_mark_resolved() : m.page_reports_dismiss(),
                run: () => run(selection.ids, bulk, selection.clear),
              }
        }
        error={null}
        onClose={() => {
          setBulk(null)
        }}
        pending={close.isPending}
      />
    </DashboardPage>
  )
}
