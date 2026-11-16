import { Search, Undo, Users } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import type { GroupRequestItem } from "@/features/groups/lib/group-requests"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { PageAction } from "@/components/filters/filter-toolbar"
import { DashboardPage, DashboardSection } from "@/components/layout/dashboard-page"
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
  myGroupCreationRequestsQueryOptions,
  myGroupsQueryOptions,
  myOwnershipRequestsQueryOptions,
  useCancelMyRequests,
} from "@/features/groups/api/groups"
import { RequestDetailsDialog } from "@/features/groups/components/group-requests/request-parts"
import { MyGroupRow } from "@/features/groups/components/manage-groups/my-group-row"
import { MyRequestRow } from "@/features/groups/components/manage-groups/my-request-row"
import { RequestGroupDialog } from "@/features/groups/components/manage-groups/request-group-dialog"
import { toastGroupsResult } from "@/features/groups/lib/group-bulk-toast"
import { fromClaim, fromCreation } from "@/features/groups/lib/group-requests"
import { groupTableStyles } from "@/features/groups/lib/group-table-styles"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

type RequestDialog = { kind: "details" | "cancel"; requests: GroupRequestItem[]; bulk: boolean }

export function ManageGroupsPage() {
  const { data: groups } = useQuery(myGroupsQueryOptions)
  const { data: claims } = useQuery(myOwnershipRequestsQueryOptions)
  const { data: creations } = useQuery(myGroupCreationRequestsQueryOptions)
  const requests =
    claims === undefined || creations === undefined
      ? undefined
      : [...claims.map(fromClaim), ...creations.map(fromCreation)].sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt),
        )
  const selection = useSelection(
    requests?.filter((request) => request.status === "PENDING").map((request) => request.id) ?? [],
  )
  const cancel = useCancelMyRequests()
  const [dialog, setDialog] = useState<RequestDialog | null>(null)
  const [shown] = dialog?.kind === "details" ? dialog.requests : []
  const cancelling = dialog?.kind === "cancel" ? dialog.requests : null
  const [only] = cancelling ?? []

  return (
    <DashboardPage
      actions={
        <>
          <PageAction render={<Link to="/groups" />} variant="outline">
            <Search />
            {m.my_groups_find()}
          </PageAction>
          <RequestGroupDialog />
        </>
      }
      subtitle={m.my_groups_subtitle()}
      title={m.my_groups_title()}
    >
      <DashboardSection title={m.my_groups_section()}>
        <CatalogTable
          columns={[
            {
              key: "group",
              label: m.all_groups_column_group(),
              skeleton: (
                <SkeletonMediaCell narrow={{ from: "4xl", content: "pills" }} thumb="logo" />
              ),
            },
            {
              key: "role",
              label: m.my_groups_column_role(),
              width: catalogStyles.colMedium,
              from: "3xl",
              skeleton: <SkeletonPill width="5rem" />,
            },
            {
              key: "permissions",
              label: m.invitation_column_permissions(),
              width: groupTableStyles.colPermissions,
              from: "3xl",
              skeleton: <SkeletonPill width="7rem" />,
            },
            {
              key: "date",
              label: m.my_groups_column_joined(),
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
            groups?.length === 0
              ? {
                  icon: Users,
                  title: m.my_groups_empty_title(),
                  description: m.my_groups_empty_description(),
                }
              : null
          }
          footer={
            groups === undefined ? null : (
              <CatalogFooter total={m.catalog_results({ count: formatNumber(groups.length) })}>
                {null}
              </CatalogFooter>
            )
          }
          loading={groups === undefined}
          toolbar={null}
        >
          {groups?.map((membership) => (
            <MyGroupRow key={membership.group.id} membership={membership} />
          ))}
        </CatalogTable>
      </DashboardSection>
      {requests?.length === 0 ? null : (
        <DashboardSection title={m.my_requests_section()}>
          <CatalogTable
            bulkBar={
              <BulkBar count={selection.ids.length} onClear={selection.clear}>
                <Button
                  onClick={() => {
                    setDialog({
                      kind: "cancel",
                      requests: requests?.filter((request) => selection.has(request.id)) ?? [],
                      bulk: true,
                    })
                  }}
                  variant="destructive-outline"
                >
                  <Undo />
                  {m.request_cancel()}
                </Button>
              </BulkBar>
            }
            columns={[
              {
                key: "request",
                label: m.all_groups_column_group(),
                skeleton: (
                  <SkeletonMediaCell narrow={{ from: "4xl", content: "pills" }} thumb="logo" />
                ),
              },
              {
                key: "type",
                label: m.group_requests_type(),
                width: catalogStyles.colWide,
                from: "3xl",
                skeleton: <SkeletonPill width="5.5rem" />,
              },
              {
                key: "status",
                label: m.group_requests_column_status(),
                width: catalogStyles.colWide,
                from: "3xl",
                skeleton: <SkeletonPill width="5.5rem" />,
              },
              {
                key: "date",
                label: m.group_requests_column_sent(),
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
            empty={null}
            footer={
              requests === undefined ? null : (
                <CatalogFooter total={m.catalog_results({ count: formatNumber(requests.length) })}>
                  {null}
                </CatalogFooter>
              )
            }
            loading={requests === undefined}
            selection={selection}
            toolbar={null}
          >
            {requests?.map((request) => (
              <MyRequestRow
                key={request.id}
                onCancel={() => {
                  setDialog({ kind: "cancel", requests: [request], bulk: false })
                }}
                onDetails={() => {
                  setDialog({ kind: "details", requests: [request], bulk: false })
                }}
                request={request}
                selection={selection}
              />
            ))}
          </CatalogTable>
        </DashboardSection>
      )}
      <RequestDetailsDialog
        footer={
          shown?.status === "PENDING" ? (
            <Button
              onClick={() => {
                setDialog({ kind: "cancel", requests: [shown], bulk: false })
              }}
              variant="destructive-outline"
            >
              {m.request_cancel()}
            </Button>
          ) : null
        }
        onClose={() => {
          setDialog(null)
        }}
        request={shown ?? null}
      />
      <ConfirmDialog
        confirmation={
          cancelling === null || only === undefined
            ? null
            : {
                title:
                  cancelling.length === 1
                    ? m.my_requests_cancel_title({ name: only.name })
                    : m.my_requests_bulk_cancel_title({ count: cancelling.length }),
                description: m.my_requests_cancel_description(),
                confirmLabel: m.request_cancel(),
                destructive: true,
                run: () =>
                  cancel
                    .mutateAsync({
                      claims: cancelling
                        .filter((request) => request.type === "claims")
                        .map((request) => request.id),
                      creations: cancelling
                        .filter((request) => request.type === "creations")
                        .map((request) => request.id),
                    })
                    .then((result) => {
                      toastGroupsResult(result, m.my_requests_bulk_cancelled, {
                        NOT_PENDING: m.group_requests_skipped_closed,
                      })

                      if (dialog?.bulk === true) {
                        selection.clear()
                      }
                    }),
              }
        }
        error={cancel.isError ? getErrorMessage(cancel.error) : null}
        onClose={() => {
          setDialog(null)
          cancel.reset()
        }}
        pending={cancel.isPending}
      />
    </DashboardPage>
  )
}
