import { CHAPTER_STATUSES, SUPPORTED_LANGUAGES } from "@taiyomoe/db/constants"
import { Activity, Languages, ListNumbered, Upload } from "@taiyomoe/ui/components/icons"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type { DeletableChapter } from "@/features/catalog/components/chapters/delete-chapter-dialog"
import type { EditableChapter } from "@/features/groups/components/manage-group/chapters/edit-chapter-form"
import { LanguageFlag } from "@/components/flags/flags"
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
  StatusDot,
} from "@/features/catalog/components/shared/catalog-toolbar"
import { catalogStyles } from "@/features/catalog/lib/catalog-styles"
import { formatNumber } from "@/features/dashboard/lib/format"
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
          <CatalogAction render={<Link to="/dashboard/upload" />}>
            <Upload />
            {m.catalog_chapter_add()}
          </CatalogAction>
        ) : undefined
      }
      subtitle={m.catalog_chapter_subtitle()}
      title={m.dashboard_nav_chapters()}
    >
      <CatalogTable
        columns={[
          { key: "chapter", label: m.catalog_column_chapter() },
          {
            key: "language",
            label: m.catalog_column_language(),
            width: catalogStyles.colNarrow,
            from: "3xl",
          },
          {
            key: "status",
            label: m.media_info_status(),
            width: catalogStyles.colMedium,
            from: "3xl",
          },
          {
            key: "credits",
            label: m.catalog_column_credits(),
            width: catalogStyles.colWide,
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
                icon: ListNumbered,
                title: m.catalog_chapter_empty_title(),
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
                      status: filter.status,
                      language: filter.language,
                      page: page === 1 ? undefined : page,
                    }}
                    to="/dashboard/chapters"
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
              label={m.catalog_chapter_search()}
              onChange={(search) => {
                update({ search })
              }}
              value={filter.search}
            />
            <CatalogSelect
              allLabel={m.catalog_all_statuses()}
              renderIcon={(status) => <StatusDot variant={SUBMISSION_STATUS[status].variant} />}
              getLabel={(status) => SUBMISSION_STATUS[status].label()}
              icon={Activity}
              label={m.media_info_status()}
              onChange={(status) => {
                update({ status })
              }}
              options={CHAPTER_STATUSES}
              value={filter.status}
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
              options={SUPPORTED_LANGUAGES}
              value={filter.language}
            />
          </CatalogToolbar>
        }
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
