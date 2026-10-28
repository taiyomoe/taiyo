import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { Popover, PopoverPopup, PopoverTrigger } from "@taiyomoe/ui/components/ui/popover"
import { colors, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { formatTimeAgo } from "@/components/time/format-time-ago"
import { TimeDetails } from "@/components/time/time-details"
import { useHoverPopover } from "@/hooks/use-hover-popover"
import { useNow } from "@/hooks/use-now"

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
})

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
