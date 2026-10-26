import type { Permissions } from "@taiyomoe/permissions"
import { Button } from "@taiyomoe/ui/components/ui/button"
import type { LatestChapter } from "@/features/chapters/api/chapters"
import type { EditableChapter } from "@/features/groups/components/manage-group/chapters/edit-chapter-form"
import { LanguageChip } from "@/components/flags/flags"
import { TimeAgo } from "@/components/time/time-ago"
import { ChapterRow } from "@/features/groups/components/manage-group/chapters/chapter-row"
import { targetOf } from "@/features/groups/lib/chapter-target"
import { m } from "@/paraglide/messages"

type PublishedChapterRowProps = {
  chapter: LatestChapter
  can: Permissions
  onEdit: (chapter: EditableChapter) => void
  onDelete: (chapterId: string) => void
}

export function PublishedChapterRow({ chapter, can, onEdit, onDelete }: PublishedChapterRowProps) {
  return (
    <ChapterRow
      actions={
        <>
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
          {can("chapter.delete", targetOf(chapter, "PUBLISHED")) ? (
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
          <TimeAgo date={chapter.createdAt} />
        </>
      }
    />
  )
}
