import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { range } from "remeda"
import type { LatestChapter } from "@/features/chapters/api/chapters"
import { LanguageFlag } from "@/components/flags/flags"
import { TimeAgo } from "@/components/time/time-ago"
import { ChapterGroups } from "@/features/chapters/components/chapter-groups"
import { ChapterNumber } from "@/features/chapters/components/chapter-number"
import { latestStyles } from "@/features/chapters/components/latest-updates/latest-styles"
import { MediaTitleLink } from "@/features/chapters/components/latest-updates/media-title-link"

const DESKTOP = "@media (width >= 64rem)"
const styles = stylex.create({
  compactFlag: {
    display: "flex",
  },
  compactTime: {
    textAlign: "right",
  },
  compact: {
    margin: 0,
    padding: 0,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    listStyle: "none",
    overflow: "hidden",
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
  },
  compactRow: {
    paddingInline: "1rem",
    alignItems: "center",
    columnGap: "0.875rem",
    display: "grid",
    gridTemplateColumns: {
      [DESKTOP]: "1.125rem minmax(0, 1fr) minmax(0, 16rem) 4rem",
      default: "1.125rem minmax(0, 1fr) auto",
    },
    borderTopColor: { default: colors.border, ":first-child": "transparent" },
    borderTopStyle: "solid",
    borderTopWidth: 1,
    height: "2.625rem",
  },
  compactGroups: {
    display: { [DESKTOP]: "flex", default: "none" },
  },
})

export function LatestCompact({ chapters }: { chapters: LatestChapter[] }) {
  return (
    <ul sx={styles.compact}>
      {chapters.map((chapter) => (
        <li key={chapter.id} sx={styles.compactRow}>
          <span sx={styles.compactFlag}>
            <LanguageFlag language={chapter.language} />
          </span>
          <div sx={latestStyles.inline}>
            <MediaTitleLink chapter={chapter} />
            <ChapterNumber number={chapter.number} />
            {chapter.title === null ? null : (
              <span sx={latestStyles.chapterTitle}>{chapter.title}</span>
            )}
          </div>
          <ChapterGroups groups={chapter.groups} sx={styles.compactGroups} />
          <TimeAgo date={chapter.createdAt} sx={styles.compactTime} />
        </li>
      ))}
    </ul>
  )
}

export function LatestCompactSkeleton({ count }: { count: number }) {
  return (
    <ul aria-hidden sx={styles.compact}>
      {range(0, count).map((index) => (
        <li key={index} sx={styles.compactRow}>
          <span />
          <Skeleton sx={latestStyles.skeletonTitle} />
          <Skeleton sx={latestStyles.skeletonTime} />
        </li>
      ))}
    </ul>
  )
}
