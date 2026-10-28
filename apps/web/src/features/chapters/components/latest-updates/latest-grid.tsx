import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { breakpoints, colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { range } from "remeda"
import type { LatestChapter } from "@/features/chapters/api/chapters"
import { LanguageChip } from "@/components/flags/flags"
import { TimeAgo } from "@/components/time/time-ago"
import { ChapterNumber } from "@/features/chapters/components/chapter-number"
import { MediaTitleLink } from "@/features/chapters/components/latest-updates/media-title-link"
import { Cover, CoverSkeleton } from "@/features/media/components/cover"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  grid: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    columnGap: "1rem",
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [breakpoints.sm]: "repeat(3, minmax(0, 1fr))",
      [breakpoints.md]: "repeat(4, minmax(0, 1fr))",
      [breakpoints.xl]: "repeat(6, minmax(0, 1fr))",
    },
    rowGap: "1.5rem",
  },
  card: {
    gap: "0.625rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  cardCoverLink: {
    borderRadius: radius.lg,
    boxShadow: shadows.raised,
    display: "block",
    outlineColor: colors.ring,
    outlineOffset: 3,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    position: "relative",
  },
  cardCover: {
    width: "100%",
  },
  cardLanguage: {
    position: "absolute",
    left: "0.5rem",
    top: "0.5rem",
  },
  cardBody: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  cardTitle: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    display: "-webkit-box",
    fontSize: "0.875rem",
    lineHeight: 1.35,
    whiteSpace: "normal",
  },
  cardMeta: {
    gap: "0.5rem",
    alignItems: "baseline",
    display: "flex",
    justifyContent: "space-between",
    minWidth: 0,
  },
  skeletonCardTitle: {
    height: "0.875rem",
    width: "80%",
  },
  skeletonCardMeta: {
    height: "0.75rem",
    width: "50%",
  },
})

export function LatestGrid({ chapters }: { chapters: LatestChapter[] }) {
  return (
    <ul sx={styles.grid}>
      {chapters.map((chapter) => (
        <li key={chapter.id} sx={styles.card}>
          <Link
            aria-label={chapter.mediaTitle ?? m.media_untitled()}
            params={{ mediaId: chapter.mediaId }}
            tabIndex={-1}
            to="/media/$mediaId"
            {...stylex.props(styles.cardCoverLink)}
          >
            <Cover src={chapter.mediaCoverUrl} sx={styles.cardCover} />
            <span sx={styles.cardLanguage}>
              <LanguageChip language={chapter.language} />
            </span>
          </Link>
          <div sx={styles.cardBody}>
            <MediaTitleLink chapter={chapter} sx={styles.cardTitle} />
            <div sx={styles.cardMeta}>
              <ChapterNumber number={chapter.number} />
              <TimeAgo date={chapter.createdAt} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function LatestGridSkeleton({ count }: { count: number }) {
  return (
    <ul aria-hidden sx={styles.grid}>
      {range(0, count).map((index) => (
        <li key={index} sx={styles.card}>
          <CoverSkeleton sx={styles.cardCover} />
          <div sx={styles.cardBody}>
            <Skeleton sx={styles.skeletonCardTitle} />
            <Skeleton sx={styles.skeletonCardMeta} />
          </div>
        </li>
      ))}
    </ul>
  )
}
