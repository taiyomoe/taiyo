import * as stylex from "@stylexjs/stylex"
import { CalendarClock, Globe } from "@taiyomoe/ui/components/icons"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { UpcomingChapter } from "@/features/chapters/api/chapters"
import { LanguageFlag } from "@/components/flags/flags"
import { TimeAgo } from "@/components/time/time-ago"
import { ChapterGroups } from "@/features/chapters/components/chapter-groups"
import { ScheduleActions } from "@/features/chapters/components/schedule-actions"
import { getChapterLabel } from "@/features/chapters/lib/chapter-label"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  row: {
    paddingBlock: "0.625rem",
    alignItems: "center",
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
    minWidth: 0,
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
  external: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  time: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    justifySelf: "end",
  },
  timeIcon: {
    flexShrink: 0,
  },
  actions: {
    gap: "0.25rem",
    display: "flex",
    justifySelf: "end",
  },
})

type UpcomingChapterRowProps = {
  chapter: UpcomingChapter
  editable: boolean
}

export function UpcomingChapterRow({ chapter, editable }: UpcomingChapterRowProps) {
  return (
    <li sx={styles.row}>
      <span sx={styles.label}>
        <LanguageFlag language={chapter.language} />
        <span sx={styles.labelText}>
          {getChapterLabel(chapter)}
          {chapter.title === null ? null : <span sx={styles.chapterTitle}> – {chapter.title}</span>}
        </span>
        {chapter.isExternal ? (
          <span title={m.chapter_external()}>
            <Globe size={14} {...stylex.props(styles.external)} />
          </span>
        ) : null}
      </span>
      <span sx={styles.time}>
        <CalendarClock size={16} {...stylex.props(styles.timeIcon)} />
        <TimeAgo date={chapter.publishAt} future />
      </span>
      <ChapterGroups groups={chapter.groups} max={3} wrap />
      {editable ? (
        <div sx={styles.actions}>
          <ScheduleActions chapter={chapter} />
        </div>
      ) : null}
    </li>
  )
}
