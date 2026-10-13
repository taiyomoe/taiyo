import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { Users } from "@taiyomoe/ui/components/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@taiyomoe/ui/components/ui/avatar"
import { Popover, PopoverPopup, PopoverTrigger } from "@taiyomoe/ui/components/ui/popover"
import { colors, font, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { LatestChapter } from "@/lib/queries/chapters"
import { useHoverPopover } from "@/lib/use-hover-popover"
import { useNow } from "@/lib/use-now"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const UNITS = [
  { unit: "year", seconds: 31_536_000 },
  { unit: "month", seconds: 2_592_000 },
  { unit: "week", seconds: 604_800 },
  { unit: "day", seconds: 86_400 },
  { unit: "hour", seconds: 3600 },
  { unit: "minute", seconds: 60 },
] as const
const TIME_ACTIVE_COLOR = `color-mix(in srgb, ${colors.mutedForeground} 60%, ${colors.foreground})`
const styles = stylex.create({
  time: {
    color: {
      "[data-popup-open]": TIME_ACTIVE_COLOR,
      default: colors.mutedForeground,
      ":hover": TIME_ACTIVE_COLOR,
    },
    cursor: "default",
    flexShrink: 0,
    fontSize: "0.8125rem",
    fontVariantNumeric: "tabular-nums",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    transitionDuration: "150ms",
    transitionProperty: "color",
    transitionTimingFunction: motion.easeOut,
    whiteSpace: "nowrap",
  },
  timeDetails: {
    gap: "0.625rem",
    paddingInline: "1rem",
    display: "flex",
    flexDirection: "column",
    maxWidth: "min(20rem, calc(100vw - 2rem))",
  },
  timeRelative: {
    margin: 0,
    color: colors.foreground,
    fontSize: "0.875rem",
    fontWeight: 600,
  },
  timeList: {
    margin: 0,
    columnGap: "1rem",
    display: "grid",
    fontSize: "0.8125rem",
    gridTemplateColumns: "auto minmax(0, 1fr)",
    rowGap: "0.375rem",
  },
  timeLabel: {
    color: colors.mutedForeground,
  },
  timeValue: {
    margin: 0,
    color: colors.foreground,
    fontVariantNumeric: "tabular-nums",
  },
  timeZone: {
    color: colors.mutedForeground,
    display: "block",
    fontSize: "0.75rem",
    overflowWrap: "anywhere",
  },
  number: {
    color: colors.primary,
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  groups: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.8125rem",
    minWidth: 0,
  },
  groupsIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  groupsTop: {
    alignItems: "flex-start",
  },
  groupNames: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexGrow: 1,
    minWidth: 0,
  },
  groupsWrap: {
    flexWrap: "wrap",
    rowGap: "0.25rem",
  },
  group: {
    overflow: "hidden",
    color: `color-mix(in srgb, ${colors.foreground} 82%, transparent)`,
    fontWeight: 500,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
    minWidth: 0,
  },
  noGroup: {
    color: colors.mutedForeground,
    fontStyle: "italic",
    paddingRight: "0.125em",
  },
  moreGroups: {
    borderRadius: radius.full,
    paddingInline: "0.375rem",
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 8%, transparent)`,
    color: colors.mutedForeground,
    flexShrink: 0,
    fontSize: "0.6875rem",
    fontWeight: 600,
    lineHeight: "1.125rem",
  },
  uploader: {
    gap: "0.5rem",
    alignItems: "center",
    color: `color-mix(in srgb, ${colors.foreground} 82%, transparent)`,
    display: "flex",
    fontSize: "0.8125rem",
    fontWeight: 500,
    minWidth: 0,
  },
  avatar: {
    fontSize: "0.625rem",
    fontWeight: 700,
    height: "1.375rem",
    width: "1.375rem",
  },
  avatarFallback: {
    backgroundColor: `color-mix(in srgb, ${colors.primary} 22%, ${colors.card})`,
    color: `color-mix(in srgb, ${colors.primary} 70%, ${colors.foreground})`,
  },
  uploaderName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
})
const formatTimeAgo = (date: Date, now: number, style: Intl.RelativeTimeFormatStyle) => {
  const elapsed = Math.max(0, (now - date.getTime()) / 1000)
  const match = UNITS.find(({ seconds }) => elapsed >= seconds)

  return match === undefined
    ? m.time_just_now()
    : new Intl.RelativeTimeFormat(getLocale(), { style }).format(
        -Math.floor(elapsed / match.seconds),
        match.unit,
      )
}

export const getChapterLabel = (chapter: Pick<LatestChapter, "number" | "volume">) =>
  [
    chapter.volume === null ? null : m.chapter_volume({ volume: chapter.volume }),
    m.chapter_number({ number: chapter.number }),
  ]
    .filter((part) => part !== null)
    .join(" ")

export function TimeAgo({ date, sx }: { date: string; sx?: Sx }) {
  const parsed = new Date(date)
  const now = useNow()
  const hover = useHoverPopover()

  return (
    <Popover onOpenChange={hover.onOpenChange} open={hover.open}>
      <PopoverTrigger
        {...hover.triggerProps}
        nativeButton={false}
        render={<time dateTime={date} suppressHydrationWarning />}
        style={hover.open ? { color: TIME_ACTIVE_COLOR } : undefined}
        sx={[styles.time, sx]}
      >
        {formatTimeAgo(parsed, now, "narrow")}
      </PopoverTrigger>
      <PopoverPopup {...hover.popupProps} arrow side="top">
        <TimeDetails date={parsed} now={now} />
      </PopoverPopup>
    </Popover>
  )
}

function TimeDetails({ date, now }: { date: Date; now: number }) {
  const locale = getLocale()
  const { timeZone } = new Intl.DateTimeFormat().resolvedOptions()

  return (
    <div sx={styles.timeDetails}>
      <p sx={styles.timeRelative}>{formatTimeAgo(date, now, "long")}</p>
      <dl sx={styles.timeList}>
        <dt sx={styles.timeLabel}>{m.time_local()}</dt>
        <dd sx={styles.timeValue}>
          {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "medium" }).format(
            date,
          )}
          <span sx={styles.timeZone}>{timeZone}</span>
        </dd>
        <dt sx={styles.timeLabel}>{m.time_utc()}</dt>
        <dd sx={styles.timeValue}>
          {new Intl.DateTimeFormat(locale, {
            dateStyle: "medium",
            timeStyle: "medium",
            timeZone: "UTC",
          }).format(date)}
        </dd>
      </dl>
    </div>
  )
}

export function ChapterNumber({ number, sx }: { number: number; sx?: Sx }) {
  return <span sx={[styles.number, sx]}>{m.chapter_number({ number })}</span>
}

type ChapterGroupsProps = {
  groups: LatestChapter["groups"]
  max?: number
  wrap?: boolean
  sx?: Sx
}

export function ChapterGroups({ groups, max = 1, wrap = false, sx }: ChapterGroupsProps) {
  const hidden = groups.slice(max)

  return (
    <span sx={[styles.groups, wrap && styles.groupsTop, sx]}>
      <Users aria-label={m.chapter_groups()} size={16} {...stylex.props(styles.groupsIcon)} />
      <span sx={[styles.groupNames, wrap && styles.groupsWrap]}>
        {groups.length === 0 ? (
          <span sx={[styles.group, styles.noGroup]}>{m.chapter_no_group()}</span>
        ) : (
          groups.slice(0, max).map((group) => (
            <span key={group.id} sx={styles.group} title={group.name}>
              {group.name}
            </span>
          ))
        )}
        {hidden.length > 0 ? (
          <span sx={styles.moreGroups} title={hidden.map((group) => group.name).join(", ")}>
            {m.chapter_more_groups({ count: hidden.length })}
          </span>
        ) : null}
      </span>
    </span>
  )
}

export function Uploader({ uploader, sx }: { uploader: LatestChapter["uploader"]; sx?: Sx }) {
  return (
    <span
      sx={[styles.uploader, sx]}
      title={m.chapter_uploaded_by({ name: uploader.displayUsername })}
    >
      <Avatar sx={styles.avatar}>
        {uploader.image === null ? null : <AvatarImage alt="" src={uploader.image} />}
        <AvatarFallback sx={styles.avatarFallback}>
          {uploader.displayUsername.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span sx={styles.uploaderName}>{uploader.displayUsername}</span>
    </span>
  )
}
