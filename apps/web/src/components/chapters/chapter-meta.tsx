import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { Users } from "@taiyomoe/ui/components/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@taiyomoe/ui/components/ui/avatar"
import { Popover, PopoverPopup, PopoverTrigger } from "@taiyomoe/ui/components/ui/popover"
import { colors, font, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
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
const MORE_GROUPS_ACTIVE_BACKGROUND = `color-mix(in srgb, ${colors.foreground} 14%, transparent)`
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
    textDecoration: "none",
    color: {
      default: `color-mix(in srgb, ${colors.foreground} 82%, transparent)`,
      ":hover": `color-mix(in srgb, ${colors.foreground} 62%, transparent)`,
    },
    fontWeight: 500,
    textOverflow: "ellipsis",
    transitionDuration: motion.enter,
    transitionProperty: "color",
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
    margin: 0,
    borderRadius: radius.full,
    borderWidth: 0,
    paddingBlock: 0,
    paddingInline: "0.375rem",
    backgroundColor: {
      "[data-popup-open]": MORE_GROUPS_ACTIVE_BACKGROUND,
      default: `color-mix(in srgb, ${colors.foreground} 8%, transparent)`,
      ":hover": MORE_GROUPS_ACTIVE_BACKGROUND,
    },
    color: {
      "[data-popup-open]": colors.foreground,
      default: colors.mutedForeground,
      ":hover": colors.foreground,
    },
    cursor: "default",
    flexShrink: 0,
    fontFamily: "inherit",
    fontSize: "0.6875rem",
    fontWeight: 600,
    lineHeight: "1.125rem",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    transitionDuration: "150ms",
    transitionProperty: "background-color, color",
    transitionTimingFunction: motion.easeOut,
  },
  moreGroupsList: {
    margin: 0,
    gap: "0.5rem",
    listStyle: "none",
    paddingInline: "1rem",
    display: "flex",
    flexDirection: "column",
    maxHeight: "min(16rem, 50vh)",
    maxWidth: "min(18rem, calc(100vw - 2rem))",
    overflowY: "auto",
  },
  moreGroupsItem: {
    gap: "0.5rem",
    alignItems: "flex-start",
    color: colors.foreground,
    display: "flex",
    fontSize: "0.8125rem",
    fontWeight: 500,
    lineHeight: 1.4,
    overflowWrap: "anywhere",
  },
  moreGroupsIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
    marginTop: "0.0625rem",
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
const formatTimeAgo = (
  date: Date,
  now: number,
  style: Intl.RelativeTimeFormatStyle,
  future = false,
) => {
  const direction = future ? 1 : -1
  const elapsed = Math.max(0, (direction * (date.getTime() - now)) / 1000)
  const match = UNITS.find(({ seconds }) => elapsed >= seconds)

  if (match === undefined) {
    return future ? m.time_any_moment() : m.time_just_now()
  }

  return new Intl.RelativeTimeFormat(getLocale(), { style }).format(
    direction * Math.floor(elapsed / match.seconds),
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

export function TimeAgo({ date, future = false, sx }: { date: string; future?: boolean; sx?: Sx }) {
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
        {formatTimeAgo(parsed, now, "narrow", future)}
      </PopoverTrigger>
      <PopoverPopup {...hover.popupProps} arrow side="top">
        <TimeDetails date={parsed} future={future} now={now} />
      </PopoverPopup>
    </Popover>
  )
}

function TimeDetails({ date, future, now }: { date: Date; future: boolean; now: number }) {
  const locale = getLocale()
  const { timeZone } = new Intl.DateTimeFormat().resolvedOptions()

  return (
    <div sx={styles.timeDetails}>
      <p sx={styles.timeRelative}>{formatTimeAgo(date, now, "long", future)}</p>
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
            <Link
              key={group.id}
              params={{ groupId: group.id }}
              title={group.name}
              to="/groups/$groupId"
              {...stylex.props(styles.group)}
            >
              {group.name}
            </Link>
          ))
        )}
        {hidden.length > 0 ? <MoreGroups groups={hidden} /> : null}
      </span>
    </span>
  )
}

function MoreGroups({ groups }: { groups: LatestChapter["groups"] }) {
  const hover = useHoverPopover()

  return (
    <Popover onOpenChange={hover.onOpenChange} open={hover.open}>
      <PopoverTrigger
        {...hover.triggerProps}
        aria-label={m.chapter_more_groups_label({ count: groups.length })}
        sx={styles.moreGroups}
      >
        {m.chapter_more_groups({ count: groups.length })}
      </PopoverTrigger>
      <PopoverPopup {...hover.popupProps} arrow side="top">
        <ul sx={styles.moreGroupsList}>
          {groups.map((group) => (
            <li key={group.id} sx={styles.moreGroupsItem}>
              <Users size={14} {...stylex.props(styles.moreGroupsIcon)} />
              <Link
                params={{ groupId: group.id }}
                to="/groups/$groupId"
                {...stylex.props(styles.group)}
              >
                {group.name}
              </Link>
            </li>
          ))}
        </ul>
      </PopoverPopup>
    </Popover>
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
