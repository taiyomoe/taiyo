import * as stylex from "@stylexjs/stylex"
import { Edit } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useDeferredValue } from "react"
import { AddToListButton } from "@/features/lists/components/add-to-list/add-to-list-button"
import { libraryEntryQueryOptions, readingProgressQueryOptions } from "@/features/media/api/library"
import { mediaQueryOptions } from "@/features/media/api/medias"
import { LibraryButton } from "@/features/media/components/media-sidebar/library-button"
import { mediaSidebarStyles } from "@/features/media/components/media-sidebar/media-sidebar-styles"
import { ProgressCard } from "@/features/media/components/media-sidebar/progress-card"
import { ReadButton } from "@/features/media/components/media-sidebar/read-button"
import { getMainTitle } from "@/features/media/lib/media-labels"
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
  const { data: media } = useSuspenseQuery(mediaQueryOptions(mediaId))

  return (
    <div sx={mediaSidebarStyles.actions}>
      {progress.data === undefined ? (
        <Skeleton sx={styles.skeletonButton} />
      ) : (
        <ReadButton mediaId={mediaId} progress={progress.data} />
      )}
      {entry.data === undefined ? (
        <Skeleton sx={styles.skeletonButton} />
      ) : (
        <LibraryButton
          mediaId={mediaId}
          notify={entry.data?.notify ?? true}
          status={entry.data?.status ?? null}
        />
      )}
      {progress.data === undefined || progress.data.lastRead === null ? null : (
        <ProgressCard progress={progress.data} />
      )}
      <AddToListButton
        mediaId={mediaId}
        mediaTitle={getMainTitle(media.titles) ?? m.media_untitled()}
      />
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
