import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { CONTENT_RATINGS } from "@taiyomoe/db/constants"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"
import type { DeletableChapter } from "@/features/catalog/components/chapters/delete-chapter-dialog"
import type { EditableChapter } from "@/features/groups/components/manage-group/chapters/edit-chapter-form"
import { DeleteChapterDialog } from "@/features/catalog/components/chapters/delete-chapter-dialog"
import { upcomingChaptersQueryOptions } from "@/features/chapters/api/chapters"
import { groupChaptersQueryOptions } from "@/features/groups/api/groups"
import { EditChapterDialog } from "@/features/groups/components/manage-group/chapters/edit-chapter-dialog"
import { groupChaptersStyles } from "@/features/groups/components/manage-group/chapters/group-chapters-styles"
import { PublishedChapters } from "@/features/groups/components/manage-group/chapters/published-chapters"
import { ScheduledChapters } from "@/features/groups/components/manage-group/chapters/scheduled-chapters"
import { m } from "@/paraglide/messages"

const PER_PAGE = 20
const ALL_RATINGS = [...CONTENT_RATINGS]
const styles = stylex.create({
  sections: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
})

export function GroupChaptersPanel({ groupId, can }: { groupId: string; can: Permissions }) {
  const [page, setPage] = useState(1)
  const { data } = useSuspenseQuery(groupChaptersQueryOptions(groupId, ALL_RATINGS, page, PER_PAGE))
  const upcoming = useQuery(upcomingChaptersQueryOptions({ contentRatings: ALL_RATINGS, groupId }))
  const [editing, setEditing] = useState<EditableChapter | null>(null)
  const [deleting, setDeleting] = useState<DeletableChapter | null>(null)
  const scheduled = upcoming.data ?? []
  const confirmDelete = (chapter: EditableChapter) => {
    setDeleting({
      id: chapter.id,
      label: `${chapter.mediaTitle ?? m.media_untitled()} — ${m.chapter_number({ number: chapter.number })}`,
    })
  }

  if (data.data.length === 0 && scheduled.length === 0) {
    return <p sx={groupChaptersStyles.empty}>{m.group_chapters_empty()}</p>
  }

  return (
    <div sx={styles.sections}>
      {scheduled.length === 0 ? null : (
        <ScheduledChapters
          can={can}
          chapters={scheduled}
          onDelete={confirmDelete}
          onEdit={setEditing}
        />
      )}
      {data.data.length === 0 ? null : (
        <PublishedChapters
          can={can}
          chapters={data.data}
          onDelete={confirmDelete}
          onEdit={setEditing}
          onPageChange={setPage}
          page={page}
          pageCount={Math.ceil(data.meta.total / PER_PAGE)}
          titled={scheduled.length > 0}
        />
      )}
      <DeleteChapterDialog
        chapter={deleting}
        onClose={() => {
          setDeleting(null)
        }}
      />
      <EditChapterDialog
        chapter={editing}
        onClose={() => {
          setEditing(null)
        }}
      />
    </div>
  )
}
