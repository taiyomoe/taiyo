import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { LatestChapter } from "@/features/chapters/api/chapters"
import { ListRow } from "@/components/layout/dashboard-page"
import { ChapterNumber } from "@/features/chapters/components/chapter-number"
import { Cover } from "@/features/media/components/cover"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  cover: {
    flexShrink: 0,
    width: "3rem",
  },
  main: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  titleLine: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  media: {
    textDecoration: "none",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    fontWeight: 600,
    overflowWrap: "anywhere",
  },
  meta: {
    gap: "0.75rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.875rem",
  },
  actions: {
    gap: "0.25rem",
    display: "flex",
    flexShrink: 0,
  },
})

export function ChapterRow({
  chapter,
  meta,
  actions,
}: {
  chapter: Pick<LatestChapter, "mediaCoverUrl" | "mediaId" | "mediaTitle" | "number">
  meta: ReactNode
  actions: ReactNode
}) {
  return (
    <ListRow>
      <Cover src={chapter.mediaCoverUrl} sx={styles.cover} />
      <div sx={styles.main}>
        <div sx={styles.titleLine}>
          <Link
            params={{ mediaId: chapter.mediaId }}
            to="/media/$mediaId"
            {...stylex.props(styles.media)}
          >
            {chapter.mediaTitle ?? m.media_untitled()}
          </Link>
          <ChapterNumber number={chapter.number} />
        </div>
        <div sx={styles.meta}>{meta}</div>
      </div>
      <div sx={styles.actions}>{actions}</div>
    </ListRow>
  )
}
