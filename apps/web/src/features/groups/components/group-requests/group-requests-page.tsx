import { CheckCircle, Close } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type { OptionSet } from "@/components/fields/option-select"
import type { GroupRequestsFilter, GroupRequestType } from "@/features/groups/api/groups"
import type { GroupRequestDialog } from "@/features/groups/components/group-requests/group-request-dialogs"
import type { GroupRequestItem } from "@/features/groups/lib/group-requests"
import { FilterChoice, FilterToolbar } from "@/components/filters/filter-toolbar"
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
import {
  groupCreationRequestsQueryOptions,
  ownershipRequestsQueryOptions,
  useApproveGroupRequests,
  useRejectGroupRequests,
} from "@/features/groups/api/groups"
import { GroupRequestDialogs } from "@/features/groups/components/group-requests/group-request-dialogs"
import { GroupRequestRow } from "@/features/groups/components/group-requests/group-request-row"
import { toastGroupsResult } from "@/features/groups/lib/group-bulk-toast"
import {
  REQUEST_STATUS_OPTIONS,
  REQUEST_TYPE_OPTIONS,
} from "@/features/groups/lib/group-request-options"
import { fromClaim, fromCreation } from "@/features/groups/lib/group-requests"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/group-requests")
const SKIP_REASONS = {
  NOT_PENDING: m.group_requests_skipped_closed,
  ALREADY_OWNED: m.group_requests_skipped_owned,
  NAME_TAKEN: m.group_requests_skipped_name_taken,
}
const useRequests = ({ type, status, page }: GroupRequestsFilter) => {
  const claims = useQuery(
    ownershipRequestsQueryOptions({
      status,
      page: type === "claims" ? page : 1,
      perPage: type === "claims" ? CATALOG_PER_PAGE : 1,
    }),
  )
  const creations = useQuery(
    groupCreationRequestsQueryOptions({
      status,
      page: type === "creations" ? page : 1,
      perPage: type === "creations" ? CATALOG_PER_PAGE : 1,
    }),
  )
  const shown = type === "claims" ? claims : creations

  return {
    items:
      type === "claims" ? claims.data?.data.map(fromClaim) : creations.data?.data.map(fromCreation),
    total: shown.data?.meta.total,
    fetching: shown.isPlaceholderData,
    counts: { claims: claims.data?.meta.total, creations: creations.data?.meta.total },
  }
}

export function GroupRequestsPage() {
  const params = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const filter: GroupRequestsFilter = {
    type: params.type ?? "claims",
    status: params.status ?? "PENDING",
    page: params.page ?? 1,
  }
  const deferred = useDeferredValue(filter)
  const { items, total, fetching, counts } = useRequests(deferred)
  const pending = filter.status === "PENDING"
  const selection = useSelection(items?.map((request) => request.id) ?? [])
  const approve = useApproveGroupRequests(deferred.type)
  const reject = useRejectGroupRequests(deferred.type)
  const [dialog, setDialog] = useState<GroupRequestDialog | null>(null)
  const typeOptions: OptionSet<GroupRequestType> = {
    ...REQUEST_TYPE_OPTIONS,
    label: (type) => {
      const count = counts[type]

      return count === undefined
        ? REQUEST_TYPE_OPTIONS.label(type)
        : m.group_requests_type_count({
            type: REQUEST_TYPE_OPTIONS.label(type),
            count: formatNumber(count),
          })
    },
  }
  const search = (next: GroupRequestsFilter) => ({
    type: next.type === "claims" ? undefined : next.type,
    status: next.status === "PENDING" ? undefined : next.status,
    page: next.page === 1 ? undefined : next.page,
  })
  const update = (patch: Partial<GroupRequestsFilter>) => {
    void navigate({ replace: true, search: search({ ...filter, ...patch, page: patch.page ?? 1 }) })
  }
  const bulk = (kind: "approve" | "reject") => () => {
    setDialog({
      kind,
      requests: items?.filter((request) => selection.has(request.id)) ?? [],
      bulk: true,
    })
  }
  const closeDialog = () => {
    if (dialog?.bulk === true) {
      selection.clear()
    }

    setDialog(null)
  }
  const blocked = items?.some((request) => selection.has(request.id) && request.blocker !== null)

  return (
    <DashboardPage subtitle={m.review_subtitle()} title={m.review_title()}>
      <CatalogTable
        bulkBar={
          <BulkBar count={selection.ids.length} onClear={selection.clear}>
            <Button
              onClick={bulk("approve")}
              title={blocked === true ? m.group_requests_bulk_blocked() : undefined}
              variant="outline"
            >
              <CheckCircle />
              {m.review_approve()}
            </Button>
            <Button onClick={bulk("reject")} variant="destructive-outline">
              <Close />
              {m.review_reject()}
            </Button>
          </BulkBar>
        }
        columns={[
          {
            key: "request",
            label: m.all_groups_column_group(),
            skeleton: <SkeletonMediaCell narrow={{ from: "4xl", content: "pills" }} thumb="logo" />,
          },
          {
            key: "requester",
            label: m.group_requests_column_requester(),
            width: catalogStyles.colWide,
            from: "3xl",
            skeleton: <SkeletonUsers />,
          },
          {
            key: "proof",
            label: m.review_proof(),
            width: catalogStyles.colWide,
            from: "4xl",
            skeleton: <SkeletonIconText width="6rem" />,
          },
          {
            key: "date",
            label: m.group_requests_column_sent(),
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
          items?.length === 0
            ? {
                icon: CheckCircle,
                title: pending ? m.review_empty_title() : m.group_requests_empty_filtered(),
                description: pending
                  ? m.review_empty_description()
                  : m.group_requests_empty_filtered_description(),
              }
            : null
        }
        fetching={fetching}
        footer={
          total === undefined ? null : (
            <CatalogFooter total={m.catalog_results({ count: formatNumber(total) })}>
              <PagePagination
                fit="container"
                onJump={(page) => {
                  update({ page })
                }}
                page={filter.page}
                pageCount={Math.ceil(total / CATALOG_PER_PAGE)}
                renderLink={(page) => (
                  <Link search={search({ ...filter, page })} to="/dashboard/group-requests" />
                )}
              />
            </CatalogFooter>
          )
        }
        loading={items === undefined}
        selection={pending ? selection : undefined}
        toolbar={
          <FilterToolbar>
            <FilterChoice
              label={m.group_requests_type()}
              onChange={(type) => {
                update({ type })
              }}
              options={typeOptions}
              value={filter.type}
            />
            <FilterChoice
              label={m.group_requests_column_status()}
              onChange={(status) => {
                update({ status })
              }}
              options={REQUEST_STATUS_OPTIONS}
              value={filter.status}
            />
          </FilterToolbar>
        }
      >
        {items?.map((request) => (
          <GroupRequestRow
            key={request.id}
            onApprove={() => {
              setDialog({ kind: "approve", requests: [request], bulk: false })
            }}
            onDetails={() => {
              setDialog({ kind: "details", requests: [request], bulk: false })
            }}
            onReject={() => {
              setDialog({ kind: "reject", requests: [request], bulk: false })
            }}
            request={request}
            selection={pending ? selection : undefined}
          />
        ))}
      </CatalogTable>
      <GroupRequestDialogs
        dialog={dialog}
        error={
          approve.isError || reject.isError ? getErrorMessage(approve.error ?? reject.error) : null
        }
        onApprove={(requests: GroupRequestItem[]) =>
          approve.mutateAsync(requests.map((request) => request.id)).then((result) => {
            toastGroupsResult(result, m.group_requests_bulk_approved, SKIP_REASONS)
            closeDialog()
          })
        }
        onClose={() => {
          setDialog(null)
          approve.reset()
          reject.reset()
        }}
        onOpen={(kind, request) => {
          setDialog({ kind, requests: [request], bulk: false })
        }}
        onReject={(requests, note) => {
          reject.mutate(
            { requestIds: requests.map((request) => request.id), note },
            {
              onSuccess: (result) => {
                toastGroupsResult(result, m.group_requests_bulk_rejected, SKIP_REASONS)
                closeDialog()
              },
            },
          )
        }}
        pending={approve.isPending || reject.isPending}
        type={deferred.type}
      />
    </DashboardPage>
  )
}
