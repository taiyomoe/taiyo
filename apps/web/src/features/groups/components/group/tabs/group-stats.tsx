import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Card } from "@taiyomoe/ui/components/ui/card"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { barY, defineChart } from "@tanstack/charts"
import { Chart } from "@tanstack/charts/react"
import { scaleBand } from "@tanstack/charts/scales/band"
import { tooltip } from "@tanstack/charts/tooltip"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Suspense, useDeferredValue, useMemo } from "react"
import { range } from "remeda"
import {
  ChartFrame,
  chartTheme,
  countAxis,
  fillChartStyle,
} from "@/features/dashboard/components/overview/chart-frame"
import { formatCompact, formatNumber } from "@/features/dashboard/lib/format"
import { type GroupStats as Stats, groupStatsQueryOptions } from "@/features/groups/api/groups"
import { PersonAvatar } from "@/features/groups/components/group-avatar"
import { groupStyles } from "@/features/groups/components/group/group-styles"
import { Cover } from "@/features/media/components/cover"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const PAST_TONE = `color-mix(in srgb, ${colors.primary} 45%, ${colors.card})`
const styles = stylex.create({
  tiles: {
    gap: "1rem",
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      [breakpoints.xl]: "repeat(4, minmax(0, 1fr))",
    },
  },
  tile: {
    padding: "1.25rem",
    gap: "0.25rem",
    minWidth: 0,
  },
  tileValue: {
    color: colors.primary,
    fontFamily: sceneFont.display,
    fontSize: { default: "1.75rem", [breakpoints.md]: "2.25rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  },
  tileLabel: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
  row: {
    gap: "1rem",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.xl]: "minmax(0, 1.6fr) minmax(0, 1fr)",
    },
  },
  card: {
    padding: "1.5rem",
    gap: "1.25rem",
    minWidth: 0,
  },
  cardHeader: {
    gap: "1rem",
    alignItems: "baseline",
    display: "flex",
    justifyContent: "space-between",
  },
  hint: {
    color: colors.mutedForeground,
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    whiteSpace: "nowrap",
  },
  bars: {
    margin: 0,
    padding: 0,
    gap: "0.875rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  bar: {
    gap: "0.875rem",
    alignItems: "center",
    display: "grid",
  },
  uploader: {
    gridTemplateColumns: "1.75rem minmax(0, 1fr) auto",
  },
  media: {
    gridTemplateColumns: "1rem 2rem minmax(0, 1fr) auto",
  },
  avatar: {
    fontSize: "0.75rem",
    height: "1.75rem",
    width: "1.75rem",
  },
  rank: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    textAlign: "center",
  },
  cover: {
    borderRadius: radius.sm,
    width: "2rem",
  },
  barMain: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  barName: {
    overflow: "hidden",
    color: colors.foreground,
    fontSize: "0.9375rem",
    fontWeight: 600,
    textDecorationLine: "none",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  track: {
    borderRadius: radius.full,
    overflow: "hidden",
    backgroundColor: colors.well,
    height: "0.375rem",
  },
  fill: {
    borderRadius: radius.full,
    backgroundImage: `linear-gradient(90deg, ${colors.warning}, ${colors.primary})`,
    height: "100%",
  },
  value: {
    fontFamily: font.mono,
    fontSize: "0.875rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    textAlign: "end",
    minWidth: "2.5rem",
  },
  skeleton: {
    borderRadius: radius.xl,
    height: "6rem",
  },
})

export function GroupStats({ groupId }: { groupId: string }) {
  return (
    <Suspense
      fallback={
        <div sx={styles.tiles}>
          {range(0, 4).map((index) => (
            <Skeleton key={index} sx={styles.skeleton} />
          ))}
        </div>
      }
    >
      <GroupStatsContent groupId={groupId} />
    </Suspense>
  )
}

function GroupStatsContent({ groupId }: { groupId: string }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const { data: stats } = useSuspenseQuery(groupStatsQueryOptions(groupId, contentRatings))

  if (stats.chapterCount === 0) {
    return <p sx={groupStyles.muted}>{m.group_stats_empty()}</p>
  }

  return (
    <div sx={groupStyles.panel}>
      <div sx={styles.tiles}>
        <Tile label={m.group_stats_chapters()} value={formatNumber(stats.chapterCount)} />
        <Tile label={m.group_stats_pages()} value={formatCompact(stats.pageCount)} />
        <Tile label={m.group_stats_reads()} value={formatCompact(stats.readCount)} />
        <Tile
          label={m.group_stats_cadence()}
          value={
            stats.averageDaysBetweenReleases === null
              ? "—"
              : m.group_stats_days({
                  days: new Intl.NumberFormat(getLocale(), { maximumFractionDigits: 1 }).format(
                    stats.averageDaysBetweenReleases,
                  ),
                })
          }
        />
      </div>
      <div sx={styles.row}>
        <StatsCard hint={m.group_stats_monthly_hint()} title={m.group_stats_monthly()}>
          <MonthlyChart monthly={stats.monthly} />
        </StatsCard>
        <StatsCard title={m.group_stats_uploaders()}>
          <ol sx={styles.bars}>
            {stats.topUploaders.map((uploader) => (
              <li key={uploader.id} sx={[styles.bar, styles.uploader]}>
                <PersonAvatar person={uploader} sx={styles.avatar} />
                <Meter
                  max={stats.topUploaders[0]?.count ?? 1}
                  name={<span sx={styles.barName}>{uploader.displayUsername}</span>}
                  value={uploader.count}
                />
                <span sx={styles.value}>{formatNumber(uploader.count)}</span>
              </li>
            ))}
          </ol>
        </StatsCard>
      </div>
      {stats.mostRead.length === 0 ? null : (
        <StatsCard title={m.group_stats_most_read()}>
          <ol sx={styles.bars}>
            {stats.mostRead.map((media, index) => (
              <li key={media.id} sx={[styles.bar, styles.media]}>
                <span sx={styles.rank}>{index + 1}</span>
                <Cover src={media.coverUrl} sx={styles.cover} />
                <Meter
                  max={stats.mostRead[0]?.readCount ?? 1}
                  name={
                    <Link
                      params={{ mediaId: media.id }}
                      to="/media/$mediaId"
                      {...stylex.props(styles.barName)}
                    >
                      {media.title ?? m.media_untitled()}
                    </Link>
                  }
                  value={media.readCount}
                />
                <span sx={styles.value}>{formatCompact(media.readCount)}</span>
              </li>
            ))}
          </ol>
        </StatsCard>
      )}
    </div>
  )
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <Card render={<article />} sx={styles.tile}>
      <span sx={styles.tileValue}>{value}</span>
      <span sx={styles.tileLabel}>{label}</span>
    </Card>
  )
}

function StatsCard({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <Card render={<section />} sx={styles.card}>
      <header sx={styles.cardHeader}>
        <h3 sx={groupStyles.heading}>{title}</h3>
        {hint === undefined ? null : <span sx={styles.hint}>{hint}</span>}
      </header>
      {children}
    </Card>
  )
}

function Meter({ name, value, max }: { name: ReactNode; value: number; max: number }) {
  return (
    <div sx={styles.barMain}>
      {name}
      <div aria-hidden sx={styles.track}>
        <div style={{ width: `${(value / Math.max(1, max)) * 100}%` }} sx={styles.fill} />
      </div>
    </div>
  )
}

const monthOf = (month: string) => new Date(`${month}-01T00:00:00Z`)

function MonthlyChart({ monthly }: { monthly: Stats["monthly"] }) {
  const definition = useMemo(() => {
    const short = new Intl.DateTimeFormat(getLocale(), { month: "short", timeZone: "UTC" })
    const long = new Intl.DateTimeFormat(getLocale(), {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    })
    const rows = monthly.map((entry, index) => ({
      id: entry.month,
      month: entry.month,
      count: entry.count,
      period: index === monthly.length - 1 ? "current" : "past",
    }))

    return defineChart({
      marks: [
        barY(rows, {
          x: "month",
          y: "count",
          color: "period",
          radius: { end: 4 },
          maxThickness: 36,
        }),
      ],
      scales: {
        x: {
          scale: () => scaleBand().padding(0.2),
          axis: {
            line: false,
            ticks: {
              size: 0,
              padding: 10,
              format: (value) => short.format(monthOf(value)),
            },
          },
        },
        y: countAxis(Math.max(...rows.map((row) => row.count))),
      },
      color: { domain: ["past", "current"], range: [PAST_TONE, colors.primary] },
      theme: chartTheme,
      focus: "group-x",
      tooltip: {
        use: tooltip,
        anchor: "group-center",
        content: ([point]) =>
          point === undefined
            ? { rows: [] }
            : {
                title: long.format(monthOf(point.datum.month)),
                rows: [
                  {
                    label: m.group_stats_chapters(),
                    value: formatNumber(point.datum.count),
                    color: colors.primary,
                  },
                ],
              },
      },
    })
  }, [monthly])

  return (
    <ChartFrame fill={240}>
      <Chart ariaLabel={m.group_stats_monthly()} definition={definition} style={fillChartStyle} />
    </ChartFrame>
  )
}
