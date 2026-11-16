import { MEDIA_STATUSES, MEDIA_TYPES } from "@taiyomoe/db/constants"
import { Activity, Book, Library, Plus, Trash } from "@taiyomoe/ui/components/icons"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type { DeletableMedia } from "@/features/catalog/components/medias/delete-media-dialog"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import {
  CATALOG_PER_PAGE,
  type MediasFilter,
  managedMediasQueryOptions,
  useRestoreMedia,
} from "@/features/catalog/api/catalog"
import { DeleteMediaDialog } from "@/features/catalog/components/medias/delete-media-dialog"
import { MediaRow } from "@/features/catalog/components/medias/media-row"
import {
  CatalogFooter,
  CatalogTable,
  VisuallyHidden,
} from "@/features/catalog/components/shared/catalog-table"
import {
  CatalogAction,
  CatalogSearch,
  CatalogSelect,
  CatalogToggle,
  CatalogToolbar,
  StatusDot,
} from "@/features/catalog/components/shared/catalog-toolbar"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { formatNumber } from "@/features/dashboard/lib/format"
import {
  MEDIA_STATUS_BADGES,
  MEDIA_STATUS_LABELS,
  MEDIA_TYPE_LABELS,
} from "@/features/media/lib/media-labels"
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
  const { data } = useQuery(managedMediasQueryOptions(useDeferredValue(filter)))
  const restore = useRestoreMedia()
  const [deleting, setDeleting] = useState<DeletableMedia | null>(null)
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
          <CatalogAction render={<Link to="/dashboard/medias/new" />}>
            <Plus />
            {m.catalog_media_add()}
          </CatalogAction>
        ) : undefined
      }
      subtitle={m.catalog_media_subtitle()}
      title={m.dashboard_nav_media()}
    >
      <CatalogTable
        columns={[
          { key: "media", label: m.catalog_column_media() },
          {
            key: "status",
            label: m.media_info_status(),
            width: catalogStyles.colMedium,
            from: "3xl",
          },
          {
            key: "chapters",
            label: m.catalog_column_chapters(),
            width: catalogStyles.colNarrow,
            from: "3xl",
          },
          {
            key: "rating",
            label: m.catalog_column_rating(),
            width: catalogStyles.colMedium,
            from: "4xl",
          },
          {
            key: "date",
            label: filter.deleted === true ? m.catalog_column_deleted() : m.catalog_column_added(),
            width: catalogStyles.colMedium,
            from: "4xl",
          },
          {
            key: "actions",
            label: <VisuallyHidden>{m.catalog_column_actions()}</VisuallyHidden>,
            width: catalogStyles.colActions,
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
        loading={data === undefined}
        toolbar={
          <CatalogToolbar>
            <CatalogSearch
              label={m.catalog_media_search()}
              onChange={(search) => {
                update({ search })
              }}
              value={filter.search}
            />
            <CatalogSelect
              allLabel={m.catalog_all_types()}
              getLabel={(type) => MEDIA_TYPE_LABELS[type]()}
              icon={Book}
              label={m.media_info_type()}
              onChange={(type) => {
                update({ type })
              }}
              options={MEDIA_TYPES}
              value={filter.type}
            />
            <CatalogSelect
              allLabel={m.catalog_all_statuses()}
              renderIcon={(status) => <StatusDot variant={MEDIA_STATUS_BADGES[status]} />}
              getLabel={(status) => MEDIA_STATUS_LABELS[status]()}
              icon={Activity}
              label={m.media_info_status()}
              onChange={(status) => {
                update({ status })
              }}
              options={MEDIA_STATUSES}
              value={filter.status}
            />
            {can("media.restore") ? (
              <CatalogToggle
                icon={Trash}
                label={m.catalog_media_only_deleted()}
                onChange={(deleted) => {
                  update({ deleted })
                }}
                pressed={filter.deleted === true}
              />
            ) : null}
          </CatalogToolbar>
        }
      >
        {data?.data.map((media) => (
          <MediaRow
            can={can}
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
      <DeleteMediaDialog
        media={deleting}
        onClose={() => {
          setDeleting(null)
        }}
      />
    </DashboardPage>
  )
}
