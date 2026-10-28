import * as stylex from "@stylexjs/stylex"
import { Edit } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useDeferredValue } from "react"
import { libraryEntryQueryOptions, readingProgressQueryOptions } from "@/features/media/api/library"
import { LibraryButton } from "@/features/media/components/media-sidebar/library-button"
import { mediaSidebarStyles } from "@/features/media/components/media-sidebar/media-sidebar-styles"
import { ProgressCard } from "@/features/media/components/media-sidebar/progress-card"
import { ReadButton } from "@/features/media/components/media-sidebar/read-button"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  skeletonButton: {
    borderRadius: radius.full,
    height: "2.75rem",
  },
})

export function SignedInActions({ mediaId, canEdit }: { mediaId: string; canEdit: boolean }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const progress = useQuery(readingProgressQueryOptions(mediaId, contentRatings))
  const entry = useQuery(libraryEntryQueryOptions(mediaId))

  return (
    <div sx={mediaSidebarStyles.actions}>
      {progress.data === undefined ? (
        <Skeleton sx={styles.skeletonButton} />
      ) : (
        <ReadButton progress={progress.data} />
      )}
      {entry.data === undefined ? (
        <Skeleton sx={styles.skeletonButton} />
      ) : (
        <LibraryButton mediaId={mediaId} status={entry.data?.status ?? null} />
      )}
      {progress.data === undefined || progress.data.lastRead === null ? null : (
        <ProgressCard progress={progress.data} />
      )}
      <Button
        render={<Link params={{ mediaId }} to="/media/$mediaId/edit" />}
        sx={mediaSidebarStyles.library}
        variant="ghost"
      >
        <Edit />
        {canEdit ? m.media_edit() : m.media_suggest_edit()}
      </Button>
    </div>
  )
}
