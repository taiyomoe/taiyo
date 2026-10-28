import type { Permissions } from "@taiyomoe/permissions"
// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import type { LatestChapter } from "@/features/chapters/api/chapters"
import type { EditableChapter } from "@/features/groups/components/manage-group/chapters/edit-chapter-form"
import { ListCard } from "@/components/layout/dashboard-page"
import { PagePagination } from "@/components/pagination/page-pagination"
import { groupChaptersStyles } from "@/features/groups/components/manage-group/chapters/group-chapters-styles"
import { PublishedChapterRow } from "@/features/groups/components/manage-group/chapters/published-chapter-row"
import { m } from "@/paraglide/messages"

export function PublishedChapters({
  chapters,
  can,
  page,
  pageCount,
  titled,
  onPageChange,
  onEdit,
  onDelete,
}: {
  chapters: LatestChapter[]
  can: Permissions
  page: number
  pageCount: number
  titled: boolean
  onPageChange: (page: number) => void
  onEdit: (chapter: EditableChapter) => void
  onDelete: (chapterId: string) => void
}) {
  return (
    <section sx={groupChaptersStyles.section}>
      {titled ? <h3 sx={groupChaptersStyles.sectionTitle}>{m.group_chapters()}</h3> : null}
      <ListCard>
        {chapters.map((chapter) => (
          <PublishedChapterRow
            can={can}
            chapter={chapter}
            key={chapter.id}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </ListCard>
      <PagePagination
        onJump={onPageChange}
        page={page}
        pageCount={pageCount}
        renderLink={(target) => (
          <button
            onClick={() => {
              onPageChange(target)
            }}
            type="button"
          />
        )}
      />
    </section>
  )
}
