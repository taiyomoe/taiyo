import * as stylex from "@stylexjs/stylex"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useDeferredValue } from "react"
import type { Session } from "@/lib/session"
import { mediaQueryOptions } from "@/features/media/api/medias"
import { Cover } from "@/features/media/components/cover"
import { MediaLockdown } from "@/features/media/components/media-lockdown/media-lockdown"
import { MediaBackdrop } from "@/features/media/components/media-page/media-backdrop"
import { MediaHeader } from "@/features/media/components/media-page/media-header"
import { mediaPageStyles } from "@/features/media/components/media-page/media-page-styles"
import { MediaTabs } from "@/features/media/components/media-page/media-tabs"
import { ReadingActions } from "@/features/media/components/media-sidebar/reading-actions"
import { useMediaCommands } from "@/features/media/hooks/use-media-commands"
import { getMainTitle } from "@/features/media/lib/media-labels"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  root: {
    isolation: "isolate",
    position: "relative",
  },
  locked: {
    minHeight: "calc(100dvh - var(--navbar-height))",
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
  const locked = media.flag === "LOCKED"
  const title = getMainTitle(media.titles)

  useMediaCommands(media, signedIn)

  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const backdrop =
    media.banners.find((banner) => contentRatings.includes(banner.contentRating))?.url ??
    media.covers.find((cover) => cover.isMainCover)?.url ??
    null

  return (
    <div sx={[styles.root, locked && styles.locked]}>
      <MediaBackdrop src={backdrop} />
      <div inert={locked} sx={mediaPageStyles.layout}>
        <aside sx={mediaPageStyles.aside}>
          <div sx={mediaPageStyles.coverSlot}>
            <Cover
              alt={title ?? ""}
              priority="high"
              src={media.covers.find((cover) => cover.isMainCover)?.url ?? null}
              sx={mediaPageStyles.cover}
            />
          </div>
          {locked ? null : (
            <div sx={styles.actionsSlot}>
              <ReadingActions canEdit={canEdit} mediaId={mediaId} signedIn={signedIn} />
            </div>
          )}
        </aside>
        <div sx={mediaPageStyles.main}>
          <MediaHeader media={media} />
          {locked ? null : <MediaTabs media={media} user={user} />}
        </div>
      </div>
      {locked ? (
        <MediaLockdown canEdit={canEdit} mediaId={mediaId} title={title ?? m.media_untitled()} />
      ) : null}
    </div>
  )
}
