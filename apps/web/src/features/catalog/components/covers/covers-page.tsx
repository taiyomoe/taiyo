import { CONTENT_RATINGS, MEDIA_LANGUAGES } from "@taiyomoe/db/constants"
import { Image, Plus } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type { ManagedCover } from "@/features/catalog/api/catalog"
import type { DeletableCover } from "@/features/catalog/components/covers/delete-cover-dialog"
import { getLanguageName } from "@/components/flags/language-flags"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import {
  CATALOG_PER_PAGE,
  type ImagesFilter,
  managedCoversQueryOptions,
} from "@/features/catalog/api/catalog"
import { CoverRow } from "@/features/catalog/components/covers/cover-row"
import { DeleteCoverDialog } from "@/features/catalog/components/covers/delete-cover-dialog"
import { CatalogTable, VisuallyHidden } from "@/features/catalog/components/shared/catalog-table"
import {
  CatalogSearch,
  CatalogSelect,
  CatalogToolbar,
} from "@/features/catalog/components/shared/catalog-toolbar"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { EditCoverDialog } from "@/features/media-images/components/covers/edit-cover-dialog"
import { CONTENT_RATING_LABELS } from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/covers/")

export function CoversPage() {
  const params = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const filter: ImagesFilter = {
    search: params.q,
    language: params.language,
    contentRating: params.contentRating,
    page: params.page ?? 1,
  }
  const { data } = useQuery(managedCoversQueryOptions(useDeferredValue(filter)))
  const [editing, setEditing] = useState<ManagedCover | null>(null)
  const [deleting, setDeleting] = useState<DeletableCover | null>(null)
  const update = (patch: Partial<ImagesFilter>) => {
    const next = { ...filter, ...patch, page: patch.page ?? 1 }

    void navigate({
      replace: true,
      search: {
        q: next.search,
        language: next.language,
        contentRating: next.contentRating,
        page: next.page === 1 ? undefined : next.page,
      },
    })
  }

  return (
    <DashboardPage
      actions={
        <Button render={<Link search={{}} to="/dashboard/covers/upload" />}>
          <Plus />
          {m.catalog_cover_add()}
        </Button>
      }
      subtitle={m.catalog_cover_subtitle()}
      title={m.dashboard_nav_covers()}
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
          allLabel={m.catalog_all_languages()}
          getLabel={getLanguageName}
          label={m.upload_language()}
          onChange={(language) => {
            update({ language })
          }}
          options={MEDIA_LANGUAGES}
          value={filter.language}
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
            sx: catalogStyles.colNarrow,
          },
          { key: "media", label: m.catalog_column_media(), sx: catalogStyles.colMedia },
          { key: "language", label: m.upload_language(), sx: catalogStyles.colNarrow },
          { key: "rating", label: m.media_images_content_rating(), sx: catalogStyles.colWide },
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
                icon: Image,
                title: m.catalog_cover_empty_title(),
                description: m.catalog_empty_description(),
              }
            : null
        }
        loading={data === undefined}
      >
        {data?.data.map((cover) => (
          <CoverRow
            cover={cover}
            key={cover.id}
            onDelete={() => {
              setDeleting({
                id: cover.id,
                mediaId: cover.media.id,
                mediaTitle: cover.media.title,
                volume: cover.volume,
                isMainCover: cover.isMainCover,
              })
            }}
            onEdit={() => {
              setEditing(cover)
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
                language: filter.language,
                contentRating: filter.contentRating,
                page: page === 1 ? undefined : page,
              }}
              to="/dashboard/covers"
            />
          )}
        />
      )}
      <EditCoverDialog
        cover={editing}
        mediaId={editing?.media.id ?? ""}
        onClose={() => {
          setEditing(null)
        }}
      />
      <DeleteCoverDialog
        cover={deleting}
        onClose={() => {
          setDeleting(null)
        }}
      />
    </DashboardPage>
  )
}
