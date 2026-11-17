import { CloudUpload, Undo } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type { ChapterSubmission, SubmissionsFilter } from "@/features/uploads/api/submissions"
import type { SubmissionDialog } from "@/features/uploads/components/submissions/my-submission-row"
import {
  FilterSearch,
  FilterSelect,
  FilterToolbar,
  PageAction,
} from "@/components/filters/filter-toolbar"
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
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { ReleaseNowDialog, RescheduleDialog } from "@/features/chapters/components/schedule-actions"
import { formatNumber } from "@/features/dashboard/lib/format"
import { mySubmissionsQueryOptions, SUBMISSIONS_PER_PAGE } from "@/features/uploads/api/submissions"
import {
  isWithdrawable,
  MySubmissionRow,
} from "@/features/uploads/components/submissions/my-submission-row"
import { RejectionNoteDialog } from "@/features/uploads/components/submissions/rejection-note-dialog"
import { WithdrawSubmissionsDialog } from "@/features/uploads/components/submissions/withdraw-submissions-dialog"
import { CHAPTER_STATUS_OPTIONS } from "@/features/uploads/lib/submission-status-options"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/submissions")

export function SubmissionsPage() {
  const params = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const filter: SubmissionsFilter = {
    search: params.q,
    status: params.status,
    page: params.page ?? 1,
  }
  const { data, isPlaceholderData } = useQuery(mySubmissionsQueryOptions(useDeferredValue(filter)))
  const [dialog, setDialog] = useState<{
    kind: SubmissionDialog
    submissions: ChapterSubmission[]
    bulk: boolean
  } | null>(null)
  const selection = useSelection(
    data?.data.filter(isWithdrawable).map((submission) => submission.id) ?? [],
  )
  const selectable =
    filter.status === undefined || filter.status === "PENDING" || filter.status === "UPLOADING"
  const filtered = filter.search !== undefined || filter.status !== undefined
  const empty = filtered
    ? {
        icon: CloudUpload,
        title: m.catalog_chapter_empty_title(),
        description: m.catalog_empty_description(),
      }
    : {
        icon: CloudUpload,
        title: m.submissions_empty_title(),
        description: m.submissions_empty_description(),
      }
  const [only] = dialog?.submissions ?? []
  const pick = (kind: SubmissionDialog) => (dialog?.kind === kind ? (only ?? null) : null)
  const schedule = (kind: "release" | "reschedule") => {
    const submission = pick(kind)
    const publishAt = submission?.publishAt ?? null

    return submission === null || publishAt === null
      ? null
      : { id: submission.id, number: submission.number, publishAt }
  }
  const close = () => {
    setDialog(null)
  }
  const search = (next: SubmissionsFilter) => ({
    q: next.search,
    status: next.status,
    page: next.page === 1 ? undefined : next.page,
  })
  const update = (patch: Partial<SubmissionsFilter>) => {
    void navigate({
      replace: true,
      search: search({ ...filter, ...patch, page: patch.page ?? 1 }),
    })
  }

  return (
    <DashboardPage
      actions={
        <PageAction render={<Link to="/dashboard/upload" />}>
          <CloudUpload />
          {m.dashboard_nav_upload()}
        </PageAction>
      }
      subtitle={m.submissions_subtitle()}
      title={m.submissions_title()}
    >
      <CatalogTable
        bulkBar={
          <BulkBar count={selection.ids.length} onClear={selection.clear}>
            <Button
              onClick={() => {
                setDialog({
                  kind: "withdraw",
                  submissions: data?.data.filter((item) => selection.has(item.id)) ?? [],
                  bulk: true,
                })
              }}
              variant="destructive-outline"
            >
              <Undo />
              {m.submission_withdraw()}
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
            key: "pages",
            label: m.catalog_column_pages(),
            width: catalogStyles.colNarrow,
            from: "3xl",
            skeleton: <SkeletonText width="1.5rem" />,
          },
          {
            key: "status",
            label: m.media_info_status(),
            width: catalogStyles.colWide,
            from: "3xl",
            skeleton: <SkeletonPill />,
          },
          {
            key: "groups",
            label: m.upload_groups(),
            width: catalogStyles.colMedium,
            from: "4xl",
            skeleton: <SkeletonIconText width="5rem" />,
          },
          {
            key: "date",
            label: m.submissions_column_submitted(),
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
                  <Link search={search({ ...filter, page })} to="/dashboard/submissions" />
                )}
              />
            </CatalogFooter>
          )
        }
        loading={data === undefined}
        selection={selectable ? selection : undefined}
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
              label={m.media_info_status()}
              onChange={(status) => {
                update({ status })
              }}
              options={CHAPTER_STATUS_OPTIONS}
              value={filter.status}
            />
          </FilterToolbar>
        }
      >
        {data?.data.map((submission) => (
          <MySubmissionRow
            key={submission.id}
            onDialog={(kind) => {
              setDialog({ kind, submissions: [submission], bulk: false })
            }}
            selection={selectable ? selection : undefined}
            submission={submission}
          />
        ))}
      </CatalogTable>
      <ReleaseNowDialog chapter={schedule("release")} onClose={close} />
      <RescheduleDialog chapter={schedule("reschedule")} onClose={close} />
      <RejectionNoteDialog onClose={close} submission={pick("note")} />
      <WithdrawSubmissionsDialog
        onClose={close}
        onDone={dialog?.bulk === true ? selection.clear : undefined}
        submissions={dialog?.kind === "withdraw" ? dialog.submissions : null}
      />
    </DashboardPage>
  )
}
