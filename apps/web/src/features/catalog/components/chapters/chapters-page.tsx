import { CHAPTER_STATUSES, SUPPORTED_LANGUAGES } from "@taiyomoe/db/constants"
import { ListNumbered, Upload } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type { DeletableChapter } from "@/features/catalog/components/chapters/delete-chapter-dialog"
import type { EditableChapter } from "@/features/groups/components/manage-group/chapters/edit-chapter-form"
import { getLanguageName } from "@/components/flags/language-flags"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import {
  CATALOG_PER_PAGE,
  type ChaptersFilter,
  managedChaptersQueryOptions,
} from "@/features/catalog/api/catalog"
import { ChapterRow } from "@/features/catalog/components/chapters/chapter-row"
import { DeleteChapterDialog } from "@/features/catalog/components/chapters/delete-chapter-dialog"
import { CatalogTable, VisuallyHidden } from "@/features/catalog/components/shared/catalog-table"
import {
  CatalogSearch,
  CatalogSelect,
  CatalogToolbar,
} from "@/features/catalog/components/shared/catalog-toolbar"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { EditChapterDialog } from "@/features/groups/components/manage-group/chapters/edit-chapter-dialog"
import { SUBMISSION_STATUS } from "@/features/uploads/lib/submission-status"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/chapters")

export function ChaptersPage() {
  const { session } = routeApi.useRouteContext()
  const params = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const can = getPermissions(session.user)
  const filter: ChaptersFilter = {
    search: params.q,
    status: params.status,
    language: params.language,
    page: params.page ?? 1,
  }
  const { data } = useQuery(managedChaptersQueryOptions(useDeferredValue(filter)))
  const [editing, setEditing] = useState<EditableChapter | null>(null)
  const [deleting, setDeleting] = useState<DeletableChapter | null>(null)
  const update = (patch: Partial<ChaptersFilter>) => {
    const next = { ...filter, ...patch, page: patch.page ?? 1 }

    void navigate({
      replace: true,
      search: {
        q: next.search,
        status: next.status,
        language: next.language,
        page: next.page === 1 ? undefined : next.page,
      },
    })
  }

  return (
    <DashboardPage
      actions={
        can("chapter.submit") ? (
          <Button render={<Link to="/dashboard/upload" />}>
            <Upload />
            {m.catalog_chapter_add()}
          </Button>
        ) : undefined
      }
      subtitle={m.catalog_chapter_subtitle()}
      title={m.dashboard_nav_chapters()}
    >
      <CatalogToolbar>
        <CatalogSearch
          label={m.catalog_chapter_search()}
          onChange={(search) => {
            update({ search })
          }}
          value={filter.search}
        />
        <CatalogSelect
          allLabel={m.catalog_all_statuses()}
          getLabel={(status) => SUBMISSION_STATUS[status].label()}
          label={m.media_info_status()}
          onChange={(status) => {
            update({ status })
          }}
          options={CHAPTER_STATUSES}
          value={filter.status}
        />
        <CatalogSelect
          allLabel={m.catalog_all_languages()}
          getLabel={getLanguageName}
          label={m.upload_language()}
          onChange={(language) => {
            update({ language })
          }}
          options={SUPPORTED_LANGUAGES}
          value={filter.language}
        />
      </CatalogToolbar>
      <CatalogTable
        columns={[
          { key: "chapter", label: m.catalog_column_chapter(), sx: catalogStyles.colMedium },
          { key: "media", label: m.catalog_column_media(), sx: catalogStyles.colMedia },
          { key: "language", label: m.upload_language(), sx: catalogStyles.colNarrow },
          { key: "status", label: m.media_info_status(), sx: catalogStyles.colMedium },
          { key: "credits", label: m.catalog_column_credits(), sx: catalogStyles.colWide },
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
                icon: ListNumbered,
                title: m.catalog_chapter_empty_title(),
                description: m.catalog_empty_description(),
              }
            : null
        }
        loading={data === undefined}
      >
        {data?.data.map((chapter) => (
          <ChapterRow
            can={can}
            chapter={chapter}
            key={chapter.id}
            onDelete={() => {
              setDeleting({
                id: chapter.id,
                label: `${chapter.mediaTitle ?? m.media_untitled()} — ${m.chapter_number({ number: chapter.number })}`,
              })
            }}
            onEdit={() => {
              setEditing(chapter)
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
                status: filter.status,
                language: filter.language,
                page: page === 1 ? undefined : page,
              }}
              to="/dashboard/chapters"
            />
          )}
        />
      )}
      <EditChapterDialog
        chapter={editing}
        onClose={() => {
          setEditing(null)
        }}
      />
      <DeleteChapterDialog
        chapter={deleting}
        onClose={() => {
          setDeleting(null)
        }}
      />
    </DashboardPage>
  )
}
