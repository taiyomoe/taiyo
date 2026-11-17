import { List } from "@taiyomoe/ui/components/icons"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type { ManagedList, ManagedListsFilter } from "@/features/lists/api/managed-lists"
import { FilterSearch, FilterToolbar } from "@/components/filters/filter-toolbar"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import { CATALOG_PER_PAGE } from "@/features/catalog/api/catalog"
import { BulkBar, BulkDeleteButton } from "@/features/catalog/components/shared/bulk-bar"
import {
  SkeletonActions,
  SkeletonMediaCell,
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
import { managedListsQueryOptions } from "@/features/lists/api/managed-lists"
import { DeleteListsDialog } from "@/features/lists/components/delete-lists-dialog"
import { EditListDialog } from "@/features/lists/components/manage/edit-list-dialog"
import { ManagedListRow } from "@/features/lists/components/manage/managed-list-row"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/lists")

export function ManagedListsPage() {
  const { session } = routeApi.useRouteContext()
  const params = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const can = getPermissions(session.user)
  const filter: ManagedListsFilter = { search: params.q, page: params.page ?? 1 }
  const { data, isPlaceholderData } = useQuery(managedListsQueryOptions(useDeferredValue(filter)))
  const selection = useSelection(data?.data.map((list) => list.id) ?? [])
  const [editing, setEditing] = useState<ManagedList | null>(null)
  const [deleting, setDeleting] = useState<{ lists: ManagedList[]; bulk: boolean } | null>(null)
  const search = (next: ManagedListsFilter) => ({
    q: next.search,
    page: next.page === 1 ? undefined : next.page,
  })
  const update = (patch: Partial<ManagedListsFilter>) => {
    void navigate({ replace: true, search: search({ ...filter, ...patch, page: patch.page ?? 1 }) })
  }

  return (
    <DashboardPage subtitle={m.lists_manage_subtitle()} title={m.dashboard_nav_lists()}>
      <CatalogTable
        bulkBar={
          <BulkBar count={selection.ids.length} onClear={selection.clear}>
            <BulkDeleteButton
              onClick={() => {
                setDeleting({
                  lists: data?.data.filter((list) => selection.has(list.id)) ?? [],
                  bulk: true,
                })
              }}
            />
          </BulkBar>
        }
        columns={[
          {
            key: "list",
            label: m.lists_manage_column_list(),
            skeleton: (
              <SkeletonMediaCell narrow={{ from: "4xl", content: "pills" }} thumb="cover" />
            ),
          },
          {
            key: "titles",
            label: m.list_editor_titles(),
            width: catalogStyles.colNarrow,
            from: "3xl",
            skeleton: <SkeletonText width="1.5rem" />,
          },
          {
            key: "upvotes",
            label: m.lists_manage_column_upvotes(),
            width: catalogStyles.colNarrow,
            from: "3xl",
            skeleton: <SkeletonText width="1.5rem" />,
          },
          {
            key: "date",
            label: m.list_updated(),
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
                icon: List,
                title: m.lists_manage_empty_title(),
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
                  <Link search={search({ ...filter, page })} to="/dashboard/lists" />
                )}
              />
            </CatalogFooter>
          )
        }
        loading={data === undefined}
        selection={selection}
        toolbar={
          <FilterToolbar>
            <FilterSearch
              label={m.lists_manage_search()}
              onChange={(next) => {
                update({ search: next })
              }}
              value={filter.search}
            />
          </FilterToolbar>
        }
      >
        {data?.data.map((list) => (
          <ManagedListRow
            can={can}
            key={list.id}
            list={list}
            onDelete={() => {
              setDeleting({ lists: [list], bulk: false })
            }}
            onEdit={() => {
              setEditing(list)
            }}
            selection={selection}
          />
        ))}
      </CatalogTable>
      {editing === null ? null : (
        <EditListDialog
          list={editing}
          onClose={() => {
            setEditing(null)
          }}
        />
      )}
      <DeleteListsDialog
        lists={deleting?.lists ?? null}
        onClose={() => {
          setDeleting(null)
        }}
        onDone={deleting?.bulk === true ? selection.clear : undefined}
      />
    </DashboardPage>
  )
}
