import { PenTool } from "@taiyomoe/ui/components/icons"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type { ManagedStaff, StaffsFilter } from "@/features/staffs/api/staffs"
import { FilterSearch, FilterToolbar } from "@/components/filters/filter-toolbar"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import { CATALOG_PER_PAGE } from "@/features/catalog/api/catalog"
import { BulkBar, BulkDeleteButton } from "@/features/catalog/components/shared/bulk-bar"
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
import { managedStaffsQueryOptions } from "@/features/staffs/api/staffs"
import { DeleteStaffsDialog } from "@/features/staffs/components/delete-staffs-dialog"
import { RenameStaffDialog } from "@/features/staffs/components/rename-staff-dialog"
import { StaffRow } from "@/features/staffs/components/staff-row"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/staffs")

export function StaffsPage() {
  const { session } = routeApi.useRouteContext()
  const params = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const can = getPermissions(session.user)
  const filter: StaffsFilter = { search: params.q, page: params.page ?? 1 }
  const { data, isPlaceholderData } = useQuery(managedStaffsQueryOptions(useDeferredValue(filter)))
  const selection = useSelection(data?.data.map((staff) => staff.id) ?? [])
  const [renaming, setRenaming] = useState<ManagedStaff | null>(null)
  const [deleting, setDeleting] = useState<{ staffs: ManagedStaff[]; bulk: boolean } | null>(null)
  const canDelete = can("staff.delete")
  const update = (patch: Partial<StaffsFilter>) => {
    const next = { ...filter, ...patch, page: patch.page ?? 1 }

    void navigate({
      replace: true,
      search: { q: next.search, page: next.page === 1 ? undefined : next.page },
    })
  }

  return (
    <DashboardPage subtitle={m.staffs_subtitle()} title={m.dashboard_nav_staff()}>
      <CatalogTable
        bulkBar={
          <BulkBar count={selection.ids.length} onClear={selection.clear}>
            <BulkDeleteButton
              onClick={() => {
                setDeleting({
                  staffs: data?.data.filter((staff) => selection.has(staff.id)) ?? [],
                  bulk: true,
                })
              }}
            />
          </BulkBar>
        }
        columns={[
          {
            key: "staff",
            label: m.staffs_column_name(),
            skeleton: (
              <SkeletonMediaCell narrow={{ from: "4xl", content: "pills" }} thumb="avatar" />
            ),
          },
          {
            key: "roles",
            label: m.staffs_column_roles(),
            width: catalogStyles.colWide,
            from: "3xl",
            skeleton: <SkeletonPill />,
          },
          {
            key: "media",
            label: m.staffs_column_media(),
            width: catalogStyles.colNarrow,
            from: "3xl",
            skeleton: <SkeletonText width="1.5rem" />,
          },
          {
            key: "date",
            label: m.catalog_column_added(),
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
                icon: PenTool,
                title: m.staffs_empty_title(),
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
                    search={{ q: filter.search, page: page === 1 ? undefined : page }}
                    to="/dashboard/staffs"
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
              label={m.staffs_search()}
              onChange={(search) => {
                update({ search })
              }}
              value={filter.search}
            />
          </FilterToolbar>
        }
      >
        {data?.data.map((staff) => (
          <StaffRow
            can={can}
            key={staff.id}
            onDelete={() => {
              setDeleting({ staffs: [staff], bulk: false })
            }}
            onRename={() => {
              setRenaming(staff)
            }}
            selection={canDelete ? selection : undefined}
            staff={staff}
          />
        ))}
      </CatalogTable>
      {renaming === null ? null : (
        <RenameStaffDialog
          onClose={() => {
            setRenaming(null)
          }}
          staff={renaming}
        />
      )}
      <DeleteStaffsDialog
        onClose={() => {
          setDeleting(null)
        }}
        onDone={deleting?.bulk === true ? selection.clear : undefined}
        staffs={deleting?.staffs ?? null}
      />
    </DashboardPage>
  )
}
