import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement } from "react"
import * as stylex from "@stylexjs/stylex"
import { Book, Bookmark, Flame, Library } from "@taiyomoe/ui/components/icons"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { UserStats } from "@/features/users/api/profile"
import { profileStyles } from "@/features/users/components/profile/profile-styles"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  grid: {
    margin: 0,
    padding: 0,
    gap: "0.75rem",
    listStyle: "none",
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [breakpoints.md]: "repeat(4, minmax(0, 1fr))",
    },
  },
  tile: {
    padding: "1rem",
    gap: "0.875rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  icon: {
    borderRadius: `calc(${radius.xxl} - 1rem - 1px)`,
    alignItems: "center",
    backgroundColor: `color-mix(in srgb, ${colors.primary} 12%, transparent)`,
    color: `color-mix(in srgb, ${colors.primary} 80%, ${colors.foreground})`,
    display: { default: "none", [breakpoints.sm]: "flex" },
    flexShrink: 0,
    justifyContent: "center",
    height: "2.5rem",
    width: "2.5rem",
  },
  text: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  label: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  unit: {
    color: colors.mutedForeground,
    fontFamily: font.sans,
    fontSize: "0.8125rem",
    fontWeight: 500,
    marginInlineStart: "0.3125rem",
  },
  value: {
    overflow: "hidden",
    fontFamily: font.mono,
    fontSize: "1.25rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
    lineHeight: 1.2,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
})

function Tile({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: (props: IconProps) => ReactElement
  label: string
  value: string
  unit?: string
}) {
  return (
    <li sx={[profileStyles.card, styles.tile]}>
      <span aria-hidden sx={styles.icon}>
        <Icon size={20} />
      </span>
      <span sx={styles.text}>
        <span sx={styles.label}>{label}</span>
        <span sx={styles.value} title={unit === undefined ? value : `${value} ${unit}`}>
          {value}
          {unit === undefined ? null : <span sx={styles.unit}>{unit}</span>}
        </span>
      </span>
    </li>
  )
}

export function ReadingHighlights({
  reading,
  library,
}: {
  reading: NonNullable<UserStats["reading"]>
  library: UserStats["library"]
}) {
  const number = new Intl.NumberFormat(getLocale(), {
    notation: "compact",
    maximumFractionDigits: 1,
  })

  return (
    <ul sx={styles.grid}>
      <Tile
        icon={Book}
        label={m.profile_stats_chapters_read()}
        value={number.format(reading.chaptersRead)}
      />
      <Tile
        icon={Library}
        label={m.profile_stats_titles_read()}
        value={number.format(reading.mediasRead)}
      />
      <Tile
        icon={Bookmark}
        label={m.profile_highlight_reading()}
        value={number.format(library?.byStatus.READING ?? 0)}
      />
      <Tile
        icon={Flame}
        label={m.profile_highlight_streak()}
        unit={reading.currentStreak === 1 ? m.profile_highlight_day() : m.profile_highlight_days()}
        value={number.format(reading.currentStreak)}
      />
    </ul>
  )
}
