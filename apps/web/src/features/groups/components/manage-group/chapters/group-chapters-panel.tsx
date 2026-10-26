import type { Permissions } from "@taiyomoe/permissions"
import * as stylex from "@stylexjs/stylex"
import { CONTENT_RATINGS } from "@taiyomoe/db/constants"
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"
import type { EditableChapter } from "@/features/groups/components/manage-group/chapters/edit-chapter-form"
import { type Confirmation, ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { upcomingChaptersQueryOptions } from "@/features/chapters/api/chapters"
import { groupChaptersQueryOptions } from "@/features/groups/api/groups"
import { EditChapterDialog } from "@/features/groups/components/manage-group/chapters/edit-chapter-dialog"
import { groupChaptersStyles } from "@/features/groups/components/manage-group/chapters/group-chapters-styles"
import { PublishedChapters } from "@/features/groups/components/manage-group/chapters/published-chapters"
import { ScheduledChapters } from "@/features/groups/components/manage-group/chapters/scheduled-chapters"
import { useInvalidateReview } from "@/features/uploads/api/submissions"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
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

type GroupChaptersPanelProps = {
  groupId: string
  can: Permissions
}

export function GroupChaptersPanel({ groupId, can }: GroupChaptersPanelProps) {
  const [page, setPage] = useState(1)
  const { data } = useSuspenseQuery(groupChaptersQueryOptions(groupId, ALL_RATINGS, page, PER_PAGE))
  const upcoming = useQuery(upcomingChaptersQueryOptions({ contentRatings: ALL_RATINGS, groupId }))
  const invalidate = useInvalidateReview()
  const remove = useMutation({
    mutationFn: async (id: string) =>
      ensureSuccess(await api.chapters[":id"].$delete({ param: { id } })),
    onSuccess: invalidate,
  })
  const [editing, setEditing] = useState<EditableChapter | null>(null)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const scheduled = upcoming.data ?? []
  const confirmDelete = (chapterId: string) => {
    setConfirmation({
      title: m.group_chapter_delete_title(),
      description: m.group_chapter_delete_description(),
      confirmLabel: m.group_chapter_delete(),
      destructive: true,
      run: () => remove.mutateAsync(chapterId),
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
      <ConfirmDialog
        confirmation={confirmation}
        error={remove.isError ? getErrorMessage(remove.error) : null}
        onClose={() => {
          setConfirmation(null)
          remove.reset()
        }}
        pending={remove.isPending}
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
