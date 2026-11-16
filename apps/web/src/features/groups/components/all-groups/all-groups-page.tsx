import { Grid, UserRemove } from "@taiyomoe/ui/components/icons"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type { ManagedGroup, ManagedGroupsFilter } from "@/features/groups/api/groups"
import { FilterSearch, FilterToggle, FilterToolbar } from "@/components/filters/filter-toolbar"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import { CATALOG_PER_PAGE } from "@/features/catalog/api/catalog"
import { BulkBar, BulkDeleteButton } from "@/features/catalog/components/shared/bulk-bar"
import {
  SkeletonActions,
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
import { managedGroupsQueryOptions } from "@/features/groups/api/groups"
import { DeleteGroupsDialog } from "@/features/groups/components/all-groups/delete-groups-dialog"
import { ManagedGroupRow } from "@/features/groups/components/all-groups/managed-group-row"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/all-groups")

export function AllGroupsPage() {
  const { session } = routeApi.useRouteContext()
  const params = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const can = getPermissions(session.user)
  const filter: ManagedGroupsFilter = {
    search: params.q,
    owned: params.unowned === true ? false : undefined,
    page: params.page ?? 1,
  }
  const { data, isPlaceholderData } = useQuery(managedGroupsQueryOptions(useDeferredValue(filter)))
  const selection = useSelection(data?.data.map((group) => group.id) ?? [])
  const [deleting, setDeleting] = useState<{ groups: ManagedGroup[]; bulk: boolean } | null>(null)
  const canDelete = can("group.delete")
  const update = (patch: Partial<ManagedGroupsFilter>) => {
    const next = { ...filter, ...patch, page: patch.page ?? 1 }

    void navigate({
      replace: true,
      search: {
        q: next.search,
        unowned: next.owned === false ? true : undefined,
        page: next.page === 1 ? undefined : next.page,
      },
    })
  }

  return (
    <DashboardPage subtitle={m.all_groups_subtitle()} title={m.dashboard_nav_all_groups()}>
      <CatalogTable
        bulkBar={
          <BulkBar count={selection.ids.length} onClear={selection.clear}>
            <BulkDeleteButton
              onClick={() => {
                setDeleting({
                  groups: data?.data.filter((group) => selection.has(group.id)) ?? [],
                  bulk: true,
                })
              }}
            />
          </BulkBar>
        }
        columns={[
          {
            key: "group",
            label: m.all_groups_column_group(),
            skeleton: <SkeletonMediaCell narrow={{ from: "4xl", content: "pills" }} thumb="logo" />,
          },
          {
            key: "owner",
            label: m.all_groups_column_owner(),
            width: catalogStyles.colWide,
            from: "3xl",
            skeleton: <SkeletonUsers />,
          },
          {
            key: "members",
            label: m.all_groups_column_members(),
            width: catalogStyles.colNarrow,
            from: "3xl",
            skeleton: <SkeletonText width="1.5rem" />,
          },
          {
            key: "chapters",
            label: m.catalog_column_chapters(),
            width: catalogStyles.colNarrow,
            from: "4xl",
            skeleton: <SkeletonText width="1.5rem" />,
          },
          {
            key: "date",
            label: m.all_groups_column_created(),
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
                icon: Grid,
                title: m.all_groups_empty_title(),
                description: m.catalog_empty_description(),
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
                  <Link
                    search={{
                      q: filter.search,
                      unowned: filter.owned === false ? true : undefined,
                      page: page === 1 ? undefined : page,
                    }}
                    to="/dashboard/all-groups"
                  />
                )}
              />
            </CatalogFooter>
          )
        }
        loading={data === undefined}
        selection={canDelete ? selection : undefined}
        toolbar={
          <FilterToolbar>
            <FilterSearch
              label={m.all_groups_search()}
              onChange={(search) => {
                update({ search })
              }}
              value={filter.search}
            />
            <FilterToggle
              icon={UserRemove}
              label={m.all_groups_only_unowned()}
              onChange={(unowned) => {
                update({ owned: unowned ? false : undefined })
              }}
              pressed={filter.owned === false}
            />
          </FilterToolbar>
        }
      >
        {data?.data.map((group) => (
          <ManagedGroupRow
            can={can}
            group={group}
            key={group.id}
            onDelete={() => {
              setDeleting({ groups: [group], bulk: false })
            }}
            selection={canDelete ? selection : undefined}
          />
        ))}
      </CatalogTable>
      <DeleteGroupsDialog
        groups={deleting?.groups ?? null}
        onClose={() => {
          setDeleting(null)
        }}
        onDone={deleting?.bulk === true ? selection.clear : undefined}
      />
    </DashboardPage>
  )
}
