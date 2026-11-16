import { CONTENT_RATINGS, MEDIA_LANGUAGES } from "@taiyomoe/db/constants"
import { Image, Languages, Plus, Shield } from "@taiyomoe/ui/components/icons"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type { ManagedCover } from "@/features/catalog/api/catalog"
import type { DeletableCover } from "@/features/catalog/components/covers/delete-cover-dialog"
import { LanguageFlag } from "@/components/flags/flags"
import { getLanguageName } from "@/components/flags/language-flags"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import {
  CATALOG_PER_PAGE,
  type ImagesFilter,
  managedCoversQueryOptions,
} from "@/features/catalog/api/catalog"
import { BulkDeleteCoversDialog } from "@/features/catalog/components/covers/bulk-delete-covers-dialog"
import { BulkEditCoversDialog } from "@/features/catalog/components/covers/bulk-edit-covers-dialog"
import { CoverRow } from "@/features/catalog/components/covers/cover-row"
import { DeleteCoverDialog } from "@/features/catalog/components/covers/delete-cover-dialog"
import {
  BulkBar,
  BulkDeleteButton,
  BulkEditButton,
} from "@/features/catalog/components/shared/bulk-bar"
import {
  CatalogFooter,
  CatalogTable,
  VisuallyHidden,
} from "@/features/catalog/components/shared/catalog-table"
import {
  CatalogAction,
  CatalogSearch,
  CatalogSelect,
  CatalogToolbar,
} from "@/features/catalog/components/shared/catalog-toolbar"
import { RatingIcon } from "@/features/catalog/components/shared/rating-icon"
import { useSelection } from "@/features/catalog/hooks/use-selection"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { formatNumber } from "@/features/dashboard/lib/format"
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
  const selection = useSelection(data?.data.map((item) => item.id) ?? [])
  const [bulk, setBulk] = useState<"edit" | "delete" | null>(null)
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
        <CatalogAction render={<Link search={{}} to="/dashboard/covers/upload" />}>
          <Plus />
          {m.catalog_cover_add()}
        </CatalogAction>
      }
      subtitle={m.catalog_cover_subtitle()}
      title={m.dashboard_nav_covers()}
    >
      <CatalogTable
        columns={[
          { key: "media", label: m.catalog_column_cover() },
          {
            key: "language",
            label: m.catalog_column_language(),
            width: catalogStyles.colNarrow,
            from: "3xl",
          },
          {
            key: "rating",
            label: m.catalog_column_rating(),
            width: catalogStyles.colMedium,
            from: "3xl",
          },
          {
            key: "uploader",
            label: m.catalog_column_uploader(),
            width: catalogStyles.colMedium,
            from: "4xl",
          },
          {
            key: "date",
            label: m.catalog_column_added(),
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
                icon: Image,
                title: m.catalog_cover_empty_title(),
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
                      language: filter.language,
                      contentRating: filter.contentRating,
                      page: page === 1 ? undefined : page,
                    }}
                    to="/dashboard/covers"
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
        loading={data === undefined}
        selection={selection}
        toolbar={
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
              renderIcon={(language) => <LanguageFlag language={language} />}
              getLabel={getLanguageName}
              icon={Languages}
              label={m.upload_language()}
              onChange={(language) => {
                update({ language })
              }}
              options={MEDIA_LANGUAGES}
              value={filter.language}
            />
            <CatalogSelect
              allLabel={m.catalog_all_ratings()}
              renderIcon={(rating) => <RatingIcon rating={rating} />}
              getLabel={(rating) => CONTENT_RATING_LABELS[rating]()}
              icon={Shield}
              label={m.media_images_content_rating()}
              onChange={(contentRating) => {
                update({ contentRating })
              }}
              options={CONTENT_RATINGS}
              value={filter.contentRating}
            />
          </CatalogToolbar>
        }
      >
        {data?.data.map((cover) => (
          <CoverRow
            selection={selection}
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
      <BulkEditCoversDialog
        coverIds={bulk === "edit" ? selection.ids : null}
        onClose={() => {
          setBulk(null)
        }}
        onDone={selection.clear}
      />
      <BulkDeleteCoversDialog
        covers={
          bulk === "delete" ? (data?.data ?? []).filter((cover) => selection.has(cover.id)) : null
        }
        onClose={() => {
          setBulk(null)
        }}
        onDone={selection.clear}
      />
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
