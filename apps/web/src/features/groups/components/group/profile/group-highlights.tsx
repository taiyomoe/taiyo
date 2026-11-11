import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement } from "react"
import * as stylex from "@stylexjs/stylex"
import { Book, Clock, Eye, Image } from "@taiyomoe/ui/components/icons"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { useDeferredValue } from "react"
import { formatCompact } from "@/features/dashboard/lib/format"
import { type Group, groupStatsQueryOptions } from "@/features/groups/api/groups"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

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
    gap: "0.875rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
  },
  icon: {
    borderRadius: radius.lg,
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
  unit: {
    color: colors.mutedForeground,
    fontFamily: font.sans,
    fontSize: "0.8125rem",
    fontWeight: 500,
    marginInlineStart: "0.3125rem",
  },
  skeleton: {
    borderRadius: radius.lg,
    height: "2.5rem",
  },
})

type Tile = {
  icon: (props: IconProps) => ReactElement
  label: string
  value: string
  unit?: string | undefined
}

export function GroupActivityTiles({ group }: { group: Group }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const stats = useQuery(groupStatsQueryOptions(group.id, contentRatings))

  if (stats.data === undefined) {
    return (
      <ul aria-hidden sx={styles.grid}>
        {[0, 1, 2, 3].map((index) => (
          <li key={index}>
            <Skeleton sx={styles.skeleton} />
          </li>
        ))}
      </ul>
    )
  }

  const days = stats.data.averageDaysBetweenReleases
  const tiles: Tile[] = [
    { icon: Book, label: m.group_stats_chapters(), value: formatCompact(stats.data.chapterCount) },
    { icon: Image, label: m.group_stats_pages(), value: formatCompact(stats.data.pageCount) },
    { icon: Eye, label: m.group_stats_reads(), value: formatCompact(stats.data.readCount) },
    {
      icon: Clock,
      label: m.group_highlight_pace(),
      value: days === null ? "—" : formatCompact(Math.round(days * 10) / 10),
      unit: days === null ? undefined : m.group_highlight_days(),
    },
  ]

  return (
    <ul sx={styles.grid}>
      {tiles.map(({ icon: Icon, label, value, unit }) => (
        <li key={label} sx={styles.tile}>
          <span aria-hidden sx={styles.icon}>
            <Icon size={20} />
          </span>
          <span sx={styles.text}>
            <span sx={styles.label}>{label}</span>
            <span sx={styles.value}>
              {value}
              {unit === undefined ? null : <span sx={styles.unit}>{unit}</span>}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}
