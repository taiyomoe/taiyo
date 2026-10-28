import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { CalendarClock, Globe } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import type { UpcomingChapter } from "@/features/chapters/api/chapters"
import type { EditableChapter } from "@/features/groups/components/manage-group/chapters/edit-chapter-form"
import { LanguageChip } from "@/components/flags/flags"
import { TimeAgo } from "@/components/time/time-ago"
import { ScheduleActions } from "@/features/chapters/components/schedule-actions"
import { ChapterRow } from "@/features/groups/components/manage-group/chapters/chapter-row"
import { targetOf } from "@/features/groups/lib/chapter-target"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  goesLive: {
    gap: "0.375rem",
    alignItems: "center",
    display: "inline-flex",
  },
})

export function ScheduledChapterRow({
  chapter,
  can,
  onEdit,
  onDelete,
}: {
  chapter: UpcomingChapter
  can: Permissions
  onEdit: (chapter: EditableChapter) => void
  onDelete: (chapterId: string) => void
}) {
  return (
    <ChapterRow
      actions={
        <>
          {can("chapter.update", targetOf(chapter, "SCHEDULED")) ? (
            <ScheduleActions chapter={chapter} />
          ) : null}
          {can("chapter.update", targetOf(chapter, "PUBLISHED")) ? (
            <Button
              onClick={() => {
                onEdit(chapter)
              }}
              size="sm"
              variant="ghost"
            >
              {m.group_chapter_edit()}
            </Button>
          ) : null}
          {can("chapter.delete", targetOf(chapter, "SCHEDULED")) ? (
            <Button
              onClick={() => {
                onDelete(chapter.id)
              }}
              size="sm"
              variant="ghost"
            >
              {m.group_chapter_delete()}
            </Button>
          ) : null}
        </>
      }
      chapter={chapter}
      meta={
        <>
          <LanguageChip language={chapter.language} />
          {chapter.title === null ? null : <span>{chapter.title}</span>}
          {chapter.isExternal ? (
            <span sx={styles.goesLive}>
              <Globe size={14} />
              {m.submission_link_only()}
            </span>
          ) : null}
          <span sx={styles.goesLive}>
            <CalendarClock size={14} />
            <TimeAgo date={chapter.publishAt} future />
          </span>
        </>
      }
    />
  )
}
