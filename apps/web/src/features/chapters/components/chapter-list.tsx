import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { Check, Clock, ExternalLink, Globe } from "@taiyomoe/ui/components/icons"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { range } from "remeda"
import type { LatestChapter } from "@/features/chapters/api/chapters"
import { LanguageFlag, getLanguageCode } from "@/components/flags/flags"
import {
  ChapterGroups,
  TimeAgo,
  Uploader,
  getChapterLabel,
} from "@/features/chapters/components/chapter-meta"
import { m } from "@/paraglide/messages"

const DESKTOP = "@media (width >= 48rem)"
const styles = stylex.create({
  chapters: {
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  chapter: {
    gridTemplateAreas: {
      [DESKTOP]: '"label time" "groups uploader"',
      default: '"label time" "groups groups" "uploader uploader"',
    },
    paddingBlock: "0.625rem",
    columnGap: "1.5rem",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    rowGap: "0.375rem",
    borderTopColor: { default: colors.border, ":first-child": "transparent" },
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
  label: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    fontSize: "0.875rem",
    fontWeight: 600,
    gridColumnEnd: "label",
    gridColumnStart: "label",
    gridRowEnd: "label",
    gridRowStart: "label",
    minWidth: 0,
  },
  labelLink: {
    textDecoration: "none",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 72%, transparent)`,
    },
    transitionDuration: motion.enter,
    transitionProperty: "color",
  },
  labelRead: {
    color: colors.mutedForeground,
  },
  sourceLink: {
    alignItems: "center",
    color: {
      default: colors.mutedForeground,
      ":hover": `color-mix(in srgb, ${colors.mutedForeground} 60%, ${colors.foreground})`,
    },
    display: "inline-flex",
    flexShrink: 0,
    transitionDuration: motion.enter,
    transitionProperty: "color",
  },
  labelText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  chapterTitle: {
    color: `color-mix(in srgb, ${colors.foreground} 72%, transparent)`,
    fontWeight: 500,
  },
  chapterTitleRead: {
    color: colors.mutedForeground,
  },
  readIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  groups: {
    gridColumnEnd: "groups",
    gridColumnStart: "groups",
    gridRowEnd: "groups",
    gridRowStart: "groups",
  },
  time: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    gridColumnEnd: "time",
    gridColumnStart: "time",
    gridRowEnd: "time",
    gridRowStart: "time",
    justifySelf: "end",
  },
  timeIcon: {
    flexShrink: 0,
  },
  uploader: {
    gridColumnEnd: "uploader",
    gridColumnStart: "uploader",
    gridRowEnd: "uploader",
    gridRowStart: "uploader",
    justifySelf: { [DESKTOP]: "end", default: "start" },
    maxWidth: { [DESKTOP]: "14rem", default: "100%" },
  },
  skeletonLabel: {
    gridColumnEnd: "label",
    gridColumnStart: "label",
    gridRowEnd: "label",
    gridRowStart: "label",
    height: "0.875rem",
    width: "min(16rem, 80%)",
  },
  skeletonMeta: {
    gridColumnEnd: "groups",
    gridColumnStart: "groups",
    gridRowEnd: "groups",
    gridRowStart: "groups",
    height: "0.75rem",
    width: "min(9rem, 50%)",
  },
})

export type ChapterListItem = Pick<
  LatestChapter,
  | "id"
  | "title"
  | "number"
  | "volume"
  | "language"
  | "createdAt"
  | "groups"
  | "uploader"
  | "externalUrl"
  | "isExternal"
> & { read?: boolean }

export function ChapterList({ chapters, sx }: { chapters: ChapterListItem[]; sx?: Sx }) {
  return (
    <ul sx={[styles.chapters, sx]}>
      {chapters.map((chapter) => (
        <ChapterListRow key={chapter.id} chapter={chapter} />
      ))}
    </ul>
  )
}

function ChapterListRow({ chapter }: { chapter: ChapterListItem }) {
  const read = chapter.read === true
  const label = (
    <>
      <LanguageFlag language={chapter.language} />
      <span sx={styles.labelText} title={getLanguageCode(chapter.language)}>
        {getChapterLabel(chapter)}
        {chapter.title === null ? null : (
          <span sx={[styles.chapterTitle, read && styles.chapterTitleRead]}>
            {" "}
            – {chapter.title}
          </span>
        )}
      </span>
      {read ? (
        <span title={m.media_chapter_read()}>
          <Check height={14} sx={styles.readIcon} width={14} />
        </span>
      ) : null}
    </>
  )

  return (
    <li sx={styles.chapter}>
      {chapter.isExternal ? (
        <Link
          params={{ chapterId: chapter.id }}
          title={m.chapter_external()}
          to="/chapters/$chapterId/source"
          {...stylex.props(styles.label, styles.labelLink, read && styles.labelRead)}
        >
          {label}
          <Globe size={14} {...stylex.props(styles.readIcon)} />
        </Link>
      ) : (
        <span sx={[styles.label, read && styles.labelRead]}>
          {label}
          {chapter.externalUrl === null ? null : (
            <Link
              aria-label={m.chapter_source_link()}
              params={{ chapterId: chapter.id }}
              title={m.chapter_source_link()}
              to="/chapters/$chapterId/source"
              {...stylex.props(styles.sourceLink)}
            >
              <ExternalLink size={14} />
            </Link>
          )}
        </span>
      )}
      <span sx={styles.time}>
        <Clock size={16} {...stylex.props(styles.timeIcon)} />
        <TimeAgo date={chapter.createdAt} />
      </span>
      <ChapterGroups groups={chapter.groups} max={3} sx={styles.groups} wrap />
      <Uploader sx={styles.uploader} uploader={chapter.uploader} />
    </li>
  )
}

export function ChapterListSkeleton({ count, sx }: { count: number; sx?: Sx }) {
  return (
    <ul aria-hidden sx={[styles.chapters, sx]}>
      {range(0, count).map((index) => (
        <li key={index} sx={styles.chapter}>
          <Skeleton sx={styles.skeletonLabel} />
          <Skeleton sx={styles.skeletonMeta} />
        </li>
      ))}
    </ul>
  )
}
