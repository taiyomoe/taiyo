import { CancelCircle, CheckCircle } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type { UserReportsFilter } from "@/features/user-reports/api/user-reports"
import type { UserReportDialog } from "@/features/user-reports/components/user-report-dialogs"
import { FilterChoice, FilterSelect, FilterToolbar } from "@/components/filters/filter-toolbar"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import { CATALOG_PER_PAGE } from "@/features/catalog/api/catalog"
import { BulkBar } from "@/features/catalog/components/shared/bulk-bar"
import {
  SkeletonActions,
  SkeletonIconText,
  SkeletonMediaCell,
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
import { toastGroupsResult } from "@/features/groups/lib/group-bulk-toast"
import { GROUP_REPORT_STATUS_OPTIONS } from "@/features/groups/lib/group-report-labels"
import {
  userReportsQueryOptions,
  useReviewUserReports,
} from "@/features/user-reports/api/user-reports"
import { UserReportDialogs } from "@/features/user-reports/components/user-report-dialogs"
import { UserReportRow } from "@/features/user-reports/components/user-report-row"
import { USER_REPORT_REASON_OPTIONS } from "@/features/user-reports/lib/user-report-labels"
import { getErrorMessage } from "@/lib/errors"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/user-reports")
const DONE = {
  RESOLVED: m.group_reports_bulk_resolved,
  DISMISSED: m.group_reports_bulk_dismissed,
}
const SKIP_REASONS = { NOT_PENDING: m.group_requests_skipped_closed }

export function UserReportsPage() {
  const { session } = routeApi.useRouteContext()
  const params = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const can = getPermissions(session.user)
  const filter: UserReportsFilter = {
    status: params.status ?? "PENDING",
    reason: params.reason,
    page: params.page ?? 1,
  }
  const { data, isPlaceholderData } = useQuery(userReportsQueryOptions(useDeferredValue(filter)))
  const pending = filter.status === "PENDING"
  const unfiltered = pending && filter.reason === undefined
  const selection = useSelection(data?.data.map((report) => report.id) ?? [])
  const review = useReviewUserReports()
  const [dialog, setDialog] = useState<UserReportDialog | null>(null)
  const search = (next: UserReportsFilter) => ({
    status: next.status === "PENDING" ? undefined : next.status,
    reason: next.reason,
    page: next.page === 1 ? undefined : next.page,
  })
  const update = (patch: Partial<UserReportsFilter>) => {
    void navigate({ replace: true, search: search({ ...filter, ...patch, page: patch.page ?? 1 }) })
  }
  const bulk = (kind: "RESOLVED" | "DISMISSED") => () => {
    setDialog({
      kind,
      reports: data?.data.filter((report) => selection.has(report.id)) ?? [],
      bulk: true,
    })
  }

  return (
    <DashboardPage subtitle={m.user_reports_subtitle()} title={m.user_reports_title()}>
      <CatalogTable
        bulkBar={
          <BulkBar count={selection.ids.length} onClear={selection.clear}>
            <Button onClick={bulk("RESOLVED")} variant="outline">
              <CheckCircle />
              {m.reports_resolve()}
            </Button>
            <Button onClick={bulk("DISMISSED")} variant="outline">
              <CancelCircle />
              {m.reports_dismiss()}
            </Button>
          </BulkBar>
        }
        columns={[
          {
            key: "user",
            label: m.users_column_user(),
            skeleton: (
              <SkeletonMediaCell narrow={{ from: "4xl", content: "pills" }} thumb="avatar" />
            ),
          },
          {
            key: "reason",
            label: m.group_report_reason(),
            width: catalogStyles.colTarget,
            from: "3xl",
            skeleton: <SkeletonIconText width="8rem" />,
          },
          {
            key: "reporter",
            label: m.group_reports_column_reporter(),
            width: catalogStyles.colWide,
            from: "4xl",
            skeleton: <SkeletonUsers />,
          },
          {
            key: "date",
            label: m.group_reports_column_reported(),
            width: catalogStyles.colWide,
            from: "3xl",
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
                title: unfiltered ? m.review_empty_title() : m.group_reports_empty_filtered(),
                description: unfiltered
                  ? m.user_reports_empty_description()
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
                pageCount={Math.ceil(data.meta.total / CATALOG_PER_PAGE)}
                renderLink={(page) => (
                  <Link search={search({ ...filter, page })} to="/dashboard/user-reports" />
                )}
              />
            </CatalogFooter>
          )
        }
        loading={data === undefined}
        selection={pending ? selection : undefined}
        toolbar={
          <FilterToolbar>
            <FilterChoice
              label={m.group_reports_status()}
              onChange={(status) => {
                update({ status })
              }}
              options={GROUP_REPORT_STATUS_OPTIONS}
              value={filter.status}
            />
            <FilterSelect
              allLabel={m.group_reports_all_reasons()}
              label={m.group_report_reason()}
              onChange={(reason) => {
                update({ reason })
              }}
              options={USER_REPORT_REASON_OPTIONS}
              value={filter.reason}
            />
          </FilterToolbar>
        }
      >
        {data?.data.map((report) => (
          <UserReportRow
            can={can}
            key={report.id}
            onDialog={(kind) => {
              setDialog({ kind, reports: [report], bulk: false })
            }}
            report={report}
            selection={pending ? selection : undefined}
          />
        ))}
      </CatalogTable>
      <UserReportDialogs
        dialog={dialog}
        error={review.isError ? getErrorMessage(review.error) : null}
        onClose={() => {
          setDialog(null)
          review.reset()
        }}
        onOpenReview={(kind, report) => {
          setDialog({ kind, reports: [report], bulk: false })
        }}
        onReview={(status, reports, note) => {
          review.mutate(
            {
              reportIds: reports.map((report) => report.id),
              status,
              ...(note === "" ? {} : { note }),
            },
            {
              onSuccess: (result) => {
                toastGroupsResult(result, DONE[status], SKIP_REASONS)

                if (dialog?.bulk === true) {
                  selection.clear()
                }

                setDialog(null)
              },
            },
          )
        }}
        pending={review.isPending}
      />
    </DashboardPage>
  )
}
