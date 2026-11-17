import { Library, Plus, Refresh, Trash } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type { DeletableMedia } from "@/features/catalog/components/medias/delete-media-dialog"
import {
  PageAction,
  FilterSearch,
  FilterSelect,
  FilterToggle,
  FilterToolbar,
} from "@/components/filters/filter-toolbar"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import {
  CATALOG_PER_PAGE,
  type MediasFilter,
  managedMediasQueryOptions,
  useBulkRestoreMedias,
  useRestoreMedia,
} from "@/features/catalog/api/catalog"
import { BulkDeleteMediasDialog } from "@/features/catalog/components/medias/bulk-delete-medias-dialog"
import { BulkEditMediasDialog } from "@/features/catalog/components/medias/bulk-edit-medias-dialog"
import { DeleteMediaDialog } from "@/features/catalog/components/medias/delete-media-dialog"
import { MediaRow } from "@/features/catalog/components/medias/media-row"
import {
  BulkBar,
  BulkDeleteButton,
  BulkEditButton,
} from "@/features/catalog/components/shared/bulk-bar"
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
import { toastBulkResult } from "@/features/catalog/lib/bulk-toast"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { formatNumber } from "@/features/dashboard/lib/format"
import { MEDIA_STATUS_OPTIONS, MEDIA_TYPE_OPTIONS } from "@/features/media/lib/media-options"
import { getErrorMessage } from "@/lib/errors"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/medias/")

export function MediasPage() {
  const { session } = routeApi.useRouteContext()
  const params = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const can = getPermissions(session.user)
  const filter: MediasFilter = {
    search: params.q,
    type: params.type,
    status: params.status,
    deleted: params.deleted,
    page: params.page ?? 1,
  }
  const { data, isPlaceholderData } = useQuery(managedMediasQueryOptions(useDeferredValue(filter)))
  const restore = useRestoreMedia()
  const [deleting, setDeleting] = useState<DeletableMedia | null>(null)
  const selection = useSelection(data?.data.map((media) => media.id) ?? [])
  const [bulk, setBulk] = useState<"edit" | "delete" | null>(null)
  const bulkRestore = useBulkRestoreMedias()
  const bulkActions =
    filter.deleted === true ? can("media.restore") : can("media.update") || can("media.delete")
  const update = (patch: Partial<MediasFilter>) => {
    const next = { ...filter, ...patch, page: patch.page ?? 1 }

    void navigate({
      replace: true,
      search: {
        q: next.search,
        type: next.type,
        status: next.status,
        deleted: next.deleted === true ? true : undefined,
        page: next.page === 1 ? undefined : next.page,
      },
    })
  }

  return (
    <DashboardPage
      actions={
        can("media.create") ? (
          <PageAction render={<Link to="/dashboard/medias/new" />}>
            <Plus />
            {m.catalog_media_add()}
          </PageAction>
        ) : undefined
      }
      subtitle={m.catalog_media_subtitle()}
      title={m.dashboard_nav_media()}
    >
      <CatalogTable
        columns={[
          {
            key: "media",
            label: m.catalog_column_media(),
            skeleton: (
              <SkeletonMediaCell narrow={{ from: "4xl", content: "pills" }} thumb="cover" />
            ),
          },
          {
            key: "status",
            label: m.media_info_status(),
            width: catalogStyles.colMedium,
            from: "3xl",
            skeleton: <SkeletonPill />,
          },
          {
            key: "chapters",
            label: m.catalog_column_chapters(),
            width: catalogStyles.colNarrow,
            from: "3xl",
            skeleton: <SkeletonText width="1.5rem" />,
          },
          {
            key: "rating",
            label: m.catalog_column_rating(),
            width: catalogStyles.colMedium,
            from: "4xl",
            skeleton: <SkeletonIconText />,
          },
          {
            key: "date",
            label: filter.deleted === true ? m.catalog_column_deleted() : m.catalog_column_added(),
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
                icon: Library,
                title: m.catalog_media_empty_title(),
                description: m.catalog_empty_description(),
              }
            : null
        }
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
                      type: filter.type,
                      status: filter.status,
                      deleted: filter.deleted,
                      page: page === 1 ? undefined : page,
                    }}
                    to="/dashboard/medias"
                  />
                )}
              />
            </CatalogFooter>
          )
        }
        bulkBar={
          <BulkBar count={selection.ids.length} onClear={selection.clear}>
            {filter.deleted === true ? (
              <Button
                loading={bulkRestore.isPending}
                onClick={() => {
                  bulkRestore.mutate(selection.ids, {
                    onSuccess: (result) => {
                      toastBulkResult(result, m.catalog_bulk_restored)
                      selection.clear()
                    },
                    onError: (error) => {
                      toastManager.add({ title: getErrorMessage(error), type: "error" })
                    },
                  })
                }}
                variant="outline"
              >
                <Refresh />
                {m.catalog_media_restore()}
              </Button>
            ) : (
              <>
                {can("media.update") ? (
                  <BulkEditButton
                    onClick={() => {
                      setBulk("edit")
                    }}
                  />
                ) : null}
                {can("media.delete") ? (
                  <BulkDeleteButton
                    onClick={() => {
                      setBulk("delete")
                    }}
                  />
                ) : null}
              </>
            )}
          </BulkBar>
        }
        fetching={isPlaceholderData}
        loading={data === undefined}
        selection={bulkActions ? selection : undefined}
        toolbar={
          <FilterToolbar>
            <FilterSearch
              label={m.catalog_media_search()}
              onChange={(search) => {
                update({ search })
              }}
              value={filter.search}
            />
            <FilterSelect
              allLabel={m.catalog_all_types()}
              label={m.media_info_type()}
              onChange={(type) => {
                update({ type })
              }}
              options={MEDIA_TYPE_OPTIONS}
              value={filter.type}
            />
            <FilterSelect
              allLabel={m.catalog_all_statuses()}
              label={m.media_info_status()}
              onChange={(status) => {
                update({ status })
              }}
              options={MEDIA_STATUS_OPTIONS}
              value={filter.status}
            />
            {can("media.restore") ? (
              <FilterToggle
                icon={Trash}
                label={m.catalog_media_only_deleted()}
                onChange={(deleted) => {
                  update({ deleted })
                }}
                pressed={filter.deleted === true}
              />
            ) : null}
          </FilterToolbar>
        }
      >
        {data?.data.map((media) => (
          <MediaRow
            can={can}
            selection={bulkActions ? selection : undefined}
            key={media.id}
            media={media}
            onDelete={() => {
              setDeleting({ id: media.id, title: media.title })
            }}
            onRestore={() => {
              restore.mutate(media.id, {
                onSuccess: () => {
                  toastManager.add({
                    title: m.catalog_media_restored({ title: media.title ?? m.media_untitled() }),
                    type: "success",
                  })
                },
                onError: (error) => {
                  toastManager.add({ title: getErrorMessage(error), type: "error" })
                },
              })
            }}
            restoring={restore.isPending && restore.variables === media.id}
          />
        ))}
      </CatalogTable>
      <BulkEditMediasDialog
        canFlag={can("media.flag")}
        mediaIds={bulk === "edit" ? selection.ids : null}
        onClose={() => {
          setBulk(null)
        }}
        onDone={selection.clear}
      />
      <BulkDeleteMediasDialog
        mediaIds={bulk === "delete" ? selection.ids : null}
        onClose={() => {
          setBulk(null)
        }}
        onDone={selection.clear}
      />
      <DeleteMediaDialog
        media={deleting}
        onClose={() => {
          setDeleting(null)
        }}
      />
    </DashboardPage>
  )
}
