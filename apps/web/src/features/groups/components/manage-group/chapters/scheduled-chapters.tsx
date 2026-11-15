import type { Permissions } from "@taiyomoe/permissions"
// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { CalendarClock } from "@taiyomoe/ui/components/icons"
import type { UpcomingChapter } from "@/features/chapters/api/chapters"
import type { EditableChapter } from "@/features/groups/components/manage-group/chapters/edit-chapter-form"
import { ListCard } from "@/components/layout/dashboard-page"
import { groupChaptersStyles } from "@/features/groups/components/manage-group/chapters/group-chapters-styles"
import { ScheduledChapterRow } from "@/features/groups/components/manage-group/chapters/scheduled-chapter-row"
import { m } from "@/paraglide/messages"

export function ScheduledChapters({
  chapters,
  can,
  onEdit,
  onDelete,
}: {
  chapters: UpcomingChapter[]
  can: Permissions
  onEdit: (chapter: EditableChapter) => void
  onDelete: (chapterId: string) => void
}) {
  return (
    <section sx={groupChaptersStyles.section}>
      <h3 sx={groupChaptersStyles.sectionTitle}>
        <CalendarClock size={14} />
        {m.media_upcoming_title()}
      </h3>
      <ListCard>
        {chapters.map((chapter) => (
          <ScheduledChapterRow
            can={can}
            chapter={chapter}
            key={chapter.id}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </ListCard>
    </section>
  )
}
