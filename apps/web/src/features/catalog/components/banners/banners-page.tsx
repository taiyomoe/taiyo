import { CONTENT_RATINGS } from "@taiyomoe/db/constants"
import { Banner, Plus } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type { ManagedBanner } from "@/features/catalog/api/catalog"
import type { DeletableBanner } from "@/features/catalog/components/banners/delete-banner-dialog"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import {
  CATALOG_PER_PAGE,
  type ImagesFilter,
  managedBannersQueryOptions,
} from "@/features/catalog/api/catalog"
import { BannerRow } from "@/features/catalog/components/banners/banner-row"
import { DeleteBannerDialog } from "@/features/catalog/components/banners/delete-banner-dialog"
import { CatalogTable, VisuallyHidden } from "@/features/catalog/components/shared/catalog-table"
import {
  CatalogSearch,
  CatalogSelect,
  CatalogToolbar,
} from "@/features/catalog/components/shared/catalog-toolbar"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { EditBannerDialog } from "@/features/media-images/components/banners/edit-banner-dialog"
import { CONTENT_RATING_LABELS } from "@/features/media/lib/media-labels"
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
  const { data } = useQuery(managedBannersQueryOptions(useDeferredValue(filter)))
  const [editing, setEditing] = useState<ManagedBanner | null>(null)
  const [deleting, setDeleting] = useState<DeletableBanner | null>(null)
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
        <Button render={<Link search={{}} to="/dashboard/banners/upload" />}>
          <Plus />
          {m.catalog_banner_add()}
        </Button>
      }
      subtitle={m.catalog_banner_subtitle()}
      title={m.dashboard_nav_banners()}
    >
      <CatalogToolbar>
        <CatalogSearch
          label={m.catalog_image_search()}
          onChange={(search) => {
            update({ search })
          }}
          value={filter.search}
        />
        <CatalogSelect
          allLabel={m.catalog_all_ratings()}
          getLabel={(rating) => CONTENT_RATING_LABELS[rating]()}
          label={m.media_images_content_rating()}
          onChange={(contentRating) => {
            update({ contentRating })
          }}
          options={CONTENT_RATINGS}
          value={filter.contentRating}
        />
      </CatalogToolbar>
      <CatalogTable
        columns={[
          {
            key: "image",
            label: <VisuallyHidden>{m.catalog_column_image()}</VisuallyHidden>,
            sx: catalogStyles.colWide,
          },
          { key: "media", label: m.catalog_column_media(), sx: catalogStyles.colMedia },
          { key: "rating", label: m.media_images_content_rating(), sx: catalogStyles.colMedium },
          { key: "uploader", label: m.catalog_column_uploader(), sx: catalogStyles.colMedium },
          { key: "date", label: m.catalog_column_added(), sx: catalogStyles.colMedium },
          {
            key: "actions",
            label: <VisuallyHidden>{m.catalog_column_actions()}</VisuallyHidden>,
            sx: catalogStyles.colActions,
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
        loading={data === undefined}
      >
        {data?.data.map((banner) => (
          <BannerRow
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
      {data === undefined ? null : (
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
                contentRating: filter.contentRating,
                page: page === 1 ? undefined : page,
              }}
              to="/dashboard/banners"
            />
          )}
        />
      )}
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
