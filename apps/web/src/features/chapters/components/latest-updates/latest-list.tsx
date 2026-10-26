import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { range } from "remeda"
import type { LatestChapter } from "@/features/chapters/api/chapters"
import { LanguageChip } from "@/components/flags/flags"
import { TimeAgo } from "@/components/time/time-ago"
import { ChapterGroups } from "@/features/chapters/components/chapter-groups"
import { ChapterNumber } from "@/features/chapters/components/chapter-number"
import { latestStyles } from "@/features/chapters/components/latest-updates/latest-styles"
import { MediaTitleLink } from "@/features/chapters/components/latest-updates/media-title-link"
import { Uploader } from "@/features/chapters/components/uploader"
import { Cover, CoverSkeleton } from "@/features/media/components/cover"
import { m } from "@/paraglide/messages"

const DESKTOP = "@media (width >= 64rem)"
const TABLET = "@media (width >= 40rem)"
const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    gap: "0.625rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  row: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    gridTemplateAreas: {
      [DESKTOP]: '"cover main groups uploader language time"',
      default: '"cover main time" "cover meta meta"',
    },
    paddingBlock: "0.375rem",
    alignItems: "center",
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.chip,
    columnGap: { [DESKTOP]: "0.875rem", default: "0.75rem" },
    display: "grid",
    gridTemplateColumns: {
      [DESKTOP]: "1.6875rem minmax(0, 1fr) minmax(0, 16rem) minmax(0, 9rem) 4.75rem 4rem",
      default: "1.6875rem minmax(0, 1fr) auto",
    },
    rowGap: "0.25rem",
    minHeight: "3.25rem",
    paddingLeft: "0.8125rem",
    paddingRight: "0.875rem",
  },
  rowCover: {
    borderRadius: `calc(${radius.md} - 0.375rem)`,
    display: "block",
    gridColumnEnd: "cover",
    gridColumnStart: "cover",
    gridRowEnd: "cover",
    gridRowStart: "cover",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
  },
  rowCoverImage: {
    borderRadius: `calc(${radius.md} - 0.375rem)`,
    width: "1.6875rem",
  },
  rowMain: {
    gridColumnEnd: "main",
    gridColumnStart: "main",
    gridRowEnd: "main",
    gridRowStart: "main",
  },
  rowMeta: {
    gap: "0.75rem",
    alignItems: "center",
    display: { [DESKTOP]: "contents", default: "flex" },
    gridColumnEnd: "meta",
    gridColumnStart: "meta",
    gridRowEnd: "meta",
    gridRowStart: "meta",
    minWidth: 0,
  },
  rowGroups: {
    gridArea: { [DESKTOP]: "groups", default: null },
    flexShrink: 1,
  },
  rowUploader: {
    gridArea: { [DESKTOP]: "uploader", default: null },
    display: { [TABLET]: "flex", default: "none" },
    flexShrink: 2,
  },
  rowLanguage: {
    gridArea: { [DESKTOP]: "language", default: null },
    justifySelf: "start",
    order: { [DESKTOP]: 0, default: -1 },
  },
  rowTime: {
    gridColumnEnd: "time",
    gridColumnStart: "time",
    gridRowEnd: "time",
    gridRowStart: "time",
    textAlign: "right",
  },
  skeletonMeta: {
    height: "0.75rem",
    width: "min(10rem, 40%)",
  },
})

export function LatestList({ chapters }: { chapters: LatestChapter[] }) {
  return (
    <ul sx={styles.list}>
      {chapters.map((chapter) => (
        <li key={chapter.id} sx={styles.row}>
          <Link
            aria-label={chapter.mediaTitle ?? m.media_untitled()}
            params={{ mediaId: chapter.mediaId }}
            tabIndex={-1}
            to="/media/$mediaId"
            {...stylex.props(styles.rowCover)}
          >
            <Cover src={chapter.mediaCoverUrl} sx={styles.rowCoverImage} />
          </Link>
          <div sx={[latestStyles.inline, styles.rowMain]}>
            <MediaTitleLink chapter={chapter} />
            <ChapterNumber number={chapter.number} />
            {chapter.title === null ? null : (
              <span sx={latestStyles.chapterTitle}>{chapter.title}</span>
            )}
          </div>
          <div sx={styles.rowMeta}>
            <ChapterGroups groups={chapter.groups} sx={styles.rowGroups} />
            <Uploader sx={styles.rowUploader} uploader={chapter.uploader} />
            <span sx={styles.rowLanguage}>
              <LanguageChip language={chapter.language} />
            </span>
          </div>
          <TimeAgo date={chapter.createdAt} sx={styles.rowTime} />
        </li>
      ))}
    </ul>
  )
}

export function LatestListSkeleton({ count }: { count: number }) {
  return (
    <ul aria-hidden sx={styles.list}>
      {range(0, count).map((index) => (
        <li key={index} sx={styles.row}>
          <CoverSkeleton sx={[styles.rowCover, styles.rowCoverImage]} />
          <div sx={[latestStyles.inline, styles.rowMain]}>
            <Skeleton sx={latestStyles.skeletonTitle} />
          </div>
          <div sx={styles.rowMeta}>
            <Skeleton sx={styles.skeletonMeta} />
          </div>
          <Skeleton sx={[styles.rowTime, latestStyles.skeletonTime]} />
        </li>
      ))}
    </ul>
  )
}
