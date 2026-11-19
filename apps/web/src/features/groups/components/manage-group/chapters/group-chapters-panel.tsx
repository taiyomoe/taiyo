import type { Permissions } from "@taiyomoe/permissions"
import type { ReactNode } from "react"
import { CONTENT_RATINGS } from "@taiyomoe/db/constants"
import { ListNumbered } from "@taiyomoe/ui/components/icons"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import type { Selection } from "@/features/catalog/hooks/use-selection"
import type {
  GroupChapter,
  GroupChapterDialogKind,
} from "@/features/groups/components/manage-group/chapters/group-chapter-row"
import { DashboardSection } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import { CATALOG_PER_PAGE } from "@/features/catalog/api/catalog"
import { BulkDeleteChaptersDialog } from "@/features/catalog/components/chapters/bulk-delete-chapters-dialog"
import { BulkEditChaptersDialog } from "@/features/catalog/components/chapters/bulk-edit-chapters-dialog"
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
import { upcomingChaptersQueryOptions } from "@/features/chapters/api/chapters"
import { ReleaseNowDialog, RescheduleDialog } from "@/features/chapters/components/schedule-actions"
import { formatNumber } from "@/features/dashboard/lib/format"
import { groupChaptersQueryOptions } from "@/features/groups/api/groups"
import { EditChapterDialog } from "@/features/groups/components/manage-group/chapters/edit-chapter-dialog"
import {
  chapterLabel,
  GroupChapterRow,
  getChapterAccess,
  isScheduled,
} from "@/features/groups/components/manage-group/chapters/group-chapter-row"
import { m } from "@/paraglide/messages"

const ALL_RATINGS = [...CONTENT_RATINGS]

type ChapterDialog = { kind: GroupChapterDialogKind; chapter: GroupChapter }

type BulkDialog = { kind: "edit" | "delete"; chapterIds: string[]; selection: Selection }

export function GroupChaptersPanel({
  groupId,
  can,
  page,
  onPageChange,
}: {
  groupId: string
  can: Permissions
  page: number
  onPageChange: (page: number) => void
}) {
  const published = useQuery({
    ...groupChaptersQueryOptions(groupId, ALL_RATINGS, page, CATALOG_PER_PAGE),
    placeholderData: keepPreviousData,
  })
  const { data: scheduled } = useQuery(
    upcomingChaptersQueryOptions({ contentRatings: ALL_RATINGS, groupId }),
  )
  const [dialog, setDialog] = useState<ChapterDialog | null>(null)
  const [bulk, setBulk] = useState<BulkDialog | null>(null)
  const pick = (kind: GroupChapterDialogKind) => (dialog?.kind === kind ? dialog.chapter : null)
  const scheduledChapter = (kind: "release" | "reschedule") => {
    const chapter = pick(kind)

    return chapter !== null && isScheduled(chapter) ? chapter : null
  }
  const editing = pick("edit")
  const deleting = pick("delete")
  const close = () => {
    setDialog(null)
  }
  const table = {
    can,
    onBulk: setBulk,
    onDialog: (kind: GroupChapterDialogKind, chapter: GroupChapter) => {
      setDialog({ kind, chapter })
    },
  }

  return (
    <>
      {scheduled?.length === 0 ? null : (
        <DashboardSection title={m.group_chapters_scheduled()}>
          <GroupChaptersTable
            {...table}
            chapters={scheduled}
            dateLabel={m.upload_release()}
            empty={null}
            fetching={false}
            pagination={null}
            total={scheduled?.length}
          />
        </DashboardSection>
      )}
      <DashboardSection title={m.group_chapters_published()}>
        <GroupChaptersTable
          {...table}
          chapters={published.data?.data}
          dateLabel={m.catalog_column_added()}
          empty={{
            icon: ListNumbered,
            title: m.group_chapters_empty_title(),
            description: m.group_chapters_empty_description(),
          }}
          fetching={published.isPlaceholderData}
          pagination={
            published.data === undefined ? null : (
              <PagePagination
                fit="container"
                onJump={onPageChange}
                page={page}
                pageCount={Math.ceil(published.data.meta.total / CATALOG_PER_PAGE)}
                renderLink={(target) => (
                  <Link
                    params={{ groupId }}
                    search={{ tab: "chapters", page: target === 1 ? undefined : target }}
                    to="/dashboard/groups/$groupId"
                  />
                )}
              />
            )
          }
          total={published.data?.meta.total}
        />
      </DashboardSection>
      <EditChapterDialog
        can={can}
        chapter={
          editing === null
            ? null
            : { ...editing, status: isScheduled(editing) ? "SCHEDULED" : "PUBLISHED" }
        }
        onClose={close}
      />
      <DeleteChapterDialog
        chapter={deleting === null ? null : { id: deleting.id, label: chapterLabel(deleting) }}
        onClose={close}
      />
      <ReleaseNowDialog chapter={scheduledChapter("release")} onClose={close} />
      <RescheduleDialog chapter={scheduledChapter("reschedule")} onClose={close} />
      <BulkEditChaptersDialog
        chapterIds={bulk?.kind === "edit" ? bulk.chapterIds : null}
        onClose={() => {
          setBulk(null)
        }}
        onDone={() => {
          bulk?.selection.clear()
        }}
      />
      <BulkDeleteChaptersDialog
        chapterIds={bulk?.kind === "delete" ? bulk.chapterIds : null}
        onClose={() => {
          setBulk(null)
        }}
        onDone={() => {
          bulk?.selection.clear()
        }}
      />
    </>
  )
}

function GroupChaptersTable({
  chapters,
  can,
  dateLabel,
  empty,
  fetching,
  pagination,
  total,
  onDialog,
  onBulk,
}: {
  chapters: readonly GroupChapter[] | undefined
  can: Permissions
  dateLabel: string
  empty: Parameters<typeof CatalogTable>[0]["empty"]
  fetching: boolean
  pagination: ReactNode
  total: number | undefined
  onDialog: (kind: GroupChapterDialogKind, chapter: GroupChapter) => void
  onBulk: (dialog: BulkDialog) => void
}) {
  const rows = (chapters ?? []).map((chapter) => ({
    chapter,
    access: getChapterAccess(chapter, can),
  }))
  const selection = useSelection(
    rows.filter(({ access }) => access.edit || access.delete).map(({ chapter }) => chapter.id),
  )
  const selected = rows.filter(({ chapter }) => selection.has(chapter.id))
  const openBulk = (kind: "edit" | "delete") => () => {
    onBulk({
      kind,
      chapterIds: selected.filter(({ access }) => access[kind]).map(({ chapter }) => chapter.id),
      selection,
    })
  }

  return (
    <CatalogTable
      bulkBar={
        <BulkBar count={selection.ids.length} onClear={selection.clear}>
          {selected.some(({ access }) => access.edit) ? (
            <BulkEditButton onClick={openBulk("edit")} />
          ) : null}
          {selected.some(({ access }) => access.delete) ? (
            <BulkDeleteButton onClick={openBulk("delete")} />
          ) : null}
        </BulkBar>
      }
      columns={[
        {
          key: "chapter",
          label: m.catalog_column_chapter(),
          skeleton: <SkeletonMediaCell narrow={{ from: "4xl", content: "pills" }} thumb="cover" />,
        },
        {
          key: "language",
          label: m.catalog_column_language(),
          width: catalogStyles.colNarrow,
          from: "3xl",
          skeleton: <SkeletonPill width="3.75rem" />,
        },
        {
          key: "pages",
          label: m.catalog_column_pages(),
          width: catalogStyles.colNarrow,
          from: "3xl",
          skeleton: <SkeletonText width="1.5rem" />,
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
          label: dateLabel,
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
      empty={chapters?.length === 0 ? empty : null}
      fetching={fetching}
      footer={
        total === undefined ? null : (
          <CatalogFooter total={m.catalog_results({ count: formatNumber(total) })}>
            {pagination}
          </CatalogFooter>
        )
      }
      loading={chapters === undefined}
      selection={selection}
      toolbar={null}
    >
      {rows.map(({ chapter, access }) => (
        <GroupChapterRow
          access={access}
          chapter={chapter}
          key={chapter.id}
          onDialog={(kind) => {
            onDialog(kind, chapter)
          }}
          selection={selection}
        />
      ))}
    </CatalogTable>
  )
}
