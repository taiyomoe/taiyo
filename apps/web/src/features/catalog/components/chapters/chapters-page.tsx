import { ListNumbered, Upload } from "@taiyomoe/ui/components/icons"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"
import type { DeletableChapter } from "@/features/catalog/components/chapters/delete-chapter-dialog"
import type { EditableChapter } from "@/features/groups/components/manage-group/chapters/edit-chapter-form"
import { SUPPORTED_LANGUAGE_OPTIONS } from "@/components/fields/language-options"
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
  type ChaptersFilter,
  managedChaptersQueryOptions,
} from "@/features/catalog/api/catalog"
import { BulkDeleteChaptersDialog } from "@/features/catalog/components/chapters/bulk-delete-chapters-dialog"
import { BulkEditChaptersDialog } from "@/features/catalog/components/chapters/bulk-edit-chapters-dialog"
import { ChapterRow } from "@/features/catalog/components/chapters/chapter-row"
import { DeleteChapterDialog } from "@/features/catalog/components/chapters/delete-chapter-dialog"
import {
  BulkBar,
  BulkDeleteButton,
  BulkEditButton,
} from "@/features/catalog/components/shared/bulk-bar"
import {
  SkeletonActions,
  SkeletonMediaCell,
  SkeletonPill,
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
import { EditChapterDialog } from "@/features/groups/components/manage-group/chapters/edit-chapter-dialog"
import { CHAPTER_STATUS_OPTIONS } from "@/features/uploads/lib/submission-status-options"
import { usePermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const routeApi = getRouteApi("/dashboard/chapters")

export function ChaptersPage() {
  const { session } = routeApi.useRouteContext()
  const params = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const can = usePermissions(session.user)
  const filter: ChaptersFilter = {
    search: params.q,
    status: params.status,
    language: params.language,
    page: params.page ?? 1,
  }
  const { data, isPlaceholderData } = useQuery(
    managedChaptersQueryOptions(useDeferredValue(filter)),
  )
  const [editing, setEditing] = useState<EditableChapter | null>(null)
  const [deleting, setDeleting] = useState<DeletableChapter | null>(null)
  const selection = useSelection(data?.data.map((item) => item.id) ?? [])
  const [bulk, setBulk] = useState<"edit" | "delete" | null>(null)
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
          <PageAction render={<Link to="/dashboard/upload" />}>
            <Upload />
            {m.catalog_chapter_add()}
          </PageAction>
        ) : undefined
      }
      subtitle={
        can("chapter.list") ? m.catalog_chapter_subtitle() : m.catalog_chapter_subtitle_groups()
      }
      title={m.dashboard_nav_chapters()}
    >
      <CatalogTable
        columns={[
          {
            key: "chapter",
            label: m.catalog_column_chapter(),
            skeleton: (
              <SkeletonMediaCell narrow={{ from: "4xl", content: "pills" }} thumb="cover" />
            ),
          },
          {
            key: "language",
            label: m.catalog_column_language(),
            width: catalogStyles.colNarrow,
            from: "3xl",
            skeleton: <SkeletonPill width="3.75rem" />,
          },
          {
            key: "status",
            label: m.media_info_status(),
            width: catalogStyles.colMedium,
            from: "3xl",
            skeleton: <SkeletonPill />,
          },
          {
            key: "credits",
            label: m.catalog_column_credits(),
            width: catalogStyles.colWide,
            from: "4xl",
            skeleton: <SkeletonUsers count={2} />,
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
              label={m.catalog_chapter_search()}
              onChange={(search) => {
                update({ search })
              }}
              value={filter.search}
            />
            <FilterSelect
              allLabel={m.catalog_all_statuses()}
              label={m.media_info_status()}
              onChange={(status) => {
                update({ status })
              }}
              options={CHAPTER_STATUS_OPTIONS}
              value={filter.status}
            />
            <FilterSelect
              allLabel={m.catalog_all_languages()}
              label={m.upload_language()}
              onChange={(language) => {
                update({ language })
              }}
              options={SUPPORTED_LANGUAGE_OPTIONS}
              value={filter.language}
            />
          </FilterToolbar>
        }
      >
        {data?.data.map((chapter) => (
          <ChapterRow
            selection={selection}
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
      <BulkEditChaptersDialog
        chapterIds={bulk === "edit" ? selection.ids : null}
        onClose={() => {
          setBulk(null)
        }}
        onDone={selection.clear}
      />
      <BulkDeleteChaptersDialog
        chapterIds={bulk === "delete" ? selection.ids : null}
        onClose={() => {
          setBulk(null)
        }}
        onDone={selection.clear}
      />
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
