import * as stylex from "@stylexjs/stylex"
import { Check, Clock, ExternalLink, Globe } from "@taiyomoe/ui/components/icons"
import { breakpoints, colors, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { LatestChapter } from "@/features/chapters/api/chapters"
import { LanguageFlag, getLanguageCode } from "@/components/flags/flags"
import { TimeAgo } from "@/components/time/time-ago"
import { ChapterGroups } from "@/features/chapters/components/chapter-groups"
import { chapterListStyles } from "@/features/chapters/components/chapter-list-styles"
import { Uploader } from "@/features/chapters/components/uploader"
import { getChapterLabel } from "@/features/chapters/lib/chapter-label"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
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
    justifySelf: { [breakpoints.md]: "end", default: "start" },
    maxWidth: { [breakpoints.md]: "14rem", default: "100%" },
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

export function ChapterListRow({ chapter }: { chapter: ChapterListItem }) {
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
    <li sx={chapterListStyles.chapter}>
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
