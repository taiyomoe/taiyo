import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { Popover, PopoverPopup, PopoverTrigger } from "@taiyomoe/ui/components/ui/popover"
import { colors, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { useHoverPopover } from "@/hooks/use-hover-popover"
import { useNow } from "@/hooks/use-now"
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
