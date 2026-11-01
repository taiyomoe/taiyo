import * as stylex from "@stylexjs/stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useDeferredValue } from "react"
import type { Session } from "@/lib/session"
import { mediaQueryOptions } from "@/features/media/api/medias"
import { Cover } from "@/features/media/components/cover"
import { MediaBackdrop } from "@/features/media/components/media-page/media-backdrop"
import { MediaHeader } from "@/features/media/components/media-page/media-header"
import { mediaPageStyles } from "@/features/media/components/media-page/media-page-styles"
import { MediaTabs } from "@/features/media/components/media-page/media-tabs"
import { ReadingActions } from "@/features/media/components/media-sidebar/reading-actions"
import { getMainTitle } from "@/features/media/lib/media-labels"
import { useSettings } from "@/lib/settings"

const styles = stylex.create({
  root: {
    isolation: "isolate",
    position: "relative",
  },
  actionsSlot: {
    gridColumnEnd: "actions",
    gridColumnStart: "actions",
    gridRowEnd: "actions",
    gridRowStart: "actions",
  },
})

export function MediaPageContent({
  mediaId,
  user,
  canEdit,
}: {
  mediaId: string
  user: Session["user"] | null
  canEdit: boolean
}) {
  const signedIn = user !== null
  const { data: media } = useSuspenseQuery(mediaQueryOptions(mediaId))
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const backdrop =
    media.banners.find((banner) => contentRatings.includes(banner.contentRating))?.url ??
    media.covers.find((cover) => cover.isMainCover)?.url ??
    null

  return (
    <div sx={styles.root}>
      <MediaBackdrop src={backdrop} />
      <div sx={mediaPageStyles.layout}>
        <aside sx={mediaPageStyles.aside}>
          <div sx={mediaPageStyles.coverSlot}>
            <Cover
              alt={getMainTitle(media.titles) ?? ""}
              priority="high"
              src={media.covers.find((cover) => cover.isMainCover)?.url ?? null}
              sx={mediaPageStyles.cover}
            />
          </div>
          <div sx={styles.actionsSlot}>
            <ReadingActions canEdit={canEdit} mediaId={mediaId} signedIn={signedIn} />
          </div>
        </aside>
        <div sx={mediaPageStyles.main}>
          <MediaHeader media={media} />
          <MediaTabs media={media} user={user} />
        </div>
      </div>
    </div>
  )
}
