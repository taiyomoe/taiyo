import { Banner, Plus } from "@taiyomoe/ui/components/icons"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type { ManagedBanner } from "@/features/catalog/api/catalog"
import type { DeletableBanner } from "@/features/catalog/components/banners/delete-banner-dialog"
import {
  PageAction,
  FilterSearch,
  FilterSelect,
  FilterToolbar,
} from "@/components/filters/filter-toolbar"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import {
  CATALOG_PER_PAGE,
  type ImagesFilter,
  managedBannersQueryOptions,
} from "@/features/catalog/api/catalog"
import { BannerRow } from "@/features/catalog/components/banners/banner-row"
import { BulkDeleteBannersDialog } from "@/features/catalog/components/banners/bulk-delete-banners-dialog"
import { BulkEditBannersDialog } from "@/features/catalog/components/banners/bulk-edit-banners-dialog"
import { DeleteBannerDialog } from "@/features/catalog/components/banners/delete-banner-dialog"
import {
  BulkBar,
  BulkDeleteButton,
  BulkEditButton,
} from "@/features/catalog/components/shared/bulk-bar"
import {
  SkeletonActions,
  SkeletonBanner,
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
import { EditBannerDialog } from "@/features/media-images/components/banners/edit-banner-dialog"
import { CONTENT_RATING_OPTIONS } from "@/features/media/lib/media-options"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/banners/")

export function BannersPage() {
  const params = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const filter: ImagesFilter = {
    search: params.q,
    contentRating: params.contentRating,
    page: params.page ?? 1,
  }
  const { data, isPlaceholderData } = useQuery(managedBannersQueryOptions(useDeferredValue(filter)))
  const [editing, setEditing] = useState<ManagedBanner | null>(null)
  const [deleting, setDeleting] = useState<DeletableBanner | null>(null)
  const selection = useSelection(data?.data.map((item) => item.id) ?? [])
  const [bulk, setBulk] = useState<"edit" | "delete" | null>(null)
  const update = (patch: Partial<ImagesFilter>) => {
    const next = { ...filter, ...patch, page: patch.page ?? 1 }

    void navigate({
      replace: true,
      search: {
        q: next.search,
        contentRating: next.contentRating,
        page: next.page === 1 ? undefined : next.page,
      },
    })
  }

  return (
    <DashboardPage
      actions={
        <PageAction render={<Link search={{}} to="/dashboard/banners/upload" />}>
          <Plus />
          {m.catalog_banner_add()}
        </PageAction>
      }
      subtitle={m.catalog_banner_subtitle()}
      title={m.dashboard_nav_banners()}
    >
      <CatalogTable
        columns={[
          {
            key: "image",
            label: <VisuallyHidden>{m.catalog_column_image()}</VisuallyHidden>,
            width: catalogStyles.colBanner,
            from: "2xl",
            skeleton: <SkeletonBanner />,
          },
          {
            key: "media",
            label: m.catalog_column_media(),
            skeleton: (
              <SkeletonMediaCell narrow={{ from: "2xl", content: "banner" }} thumb="none" />
            ),
          },
          {
            key: "rating",
            label: m.catalog_column_rating(),
            width: catalogStyles.colMedium,
            from: "3xl",
            skeleton: <SkeletonIconText />,
          },
          {
            key: "uploader",
            label: m.catalog_column_uploader(),
            width: catalogStyles.colMedium,
            from: "4xl",
            skeleton: <SkeletonUsers />,
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
                icon: Banner,
                title: m.catalog_banner_empty_title(),
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
                      contentRating: filter.contentRating,
                      page: page === 1 ? undefined : page,
                    }}
                    to="/dashboard/banners"
                  />
                )}
              />
            </CatalogFooter>
          )
        }
        bulkBar={
          <BulkBar count={selection.ids.length} onClear={selection.clear}>
            <BulkEditButton
              onClick={() => {
                setBulk("edit")
              }}
            />
            <BulkDeleteButton
              onClick={() => {
                setBulk("delete")
              }}
            />
          </BulkBar>
        }
        fetching={isPlaceholderData}
        loading={data === undefined}
        selection={selection}
        toolbar={
          <FilterToolbar>
            <FilterSearch
              label={m.catalog_image_search()}
              onChange={(search) => {
                update({ search })
              }}
              value={filter.search}
            />
            <FilterSelect
              allLabel={m.catalog_all_ratings()}
              label={m.media_images_content_rating()}
              onChange={(contentRating) => {
                update({ contentRating })
              }}
              options={CONTENT_RATING_OPTIONS}
              value={filter.contentRating}
            />
          </FilterToolbar>
        }
      >
        {data?.data.map((banner) => (
          <BannerRow
            selection={selection}
            banner={banner}
            key={banner.id}
            onDelete={() => {
              setDeleting({
                id: banner.id,
                mediaId: banner.media.id,
                mediaTitle: banner.media.title,
                last: banner.media.imageCount === 1,
              })
            }}
            onEdit={() => {
              setEditing(banner)
            }}
          />
        ))}
      </CatalogTable>
      <BulkEditBannersDialog
        bannerIds={bulk === "edit" ? selection.ids : null}
        onClose={() => {
          setBulk(null)
        }}
        onDone={selection.clear}
      />
      <BulkDeleteBannersDialog
        banners={
          bulk === "delete" ? (data?.data ?? []).filter((banner) => selection.has(banner.id)) : null
        }
        onClose={() => {
          setBulk(null)
        }}
        onDone={selection.clear}
      />
      <EditBannerDialog
        banner={editing}
        mediaId={editing?.media.id ?? ""}
        onClose={() => {
          setEditing(null)
        }}
      />
      <DeleteBannerDialog
        banner={deleting}
        onClose={() => {
          setDeleting(null)
        }}
      />
    </DashboardPage>
  )
}
