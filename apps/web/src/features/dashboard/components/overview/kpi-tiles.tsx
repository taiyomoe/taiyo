import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement } from "react"
import * as stylex from "@stylexjs/stylex"
import { Bookmark, Comment, Eye, Upload, UserAdd, Users } from "@taiyomoe/ui/components/icons"
import { Card } from "@taiyomoe/ui/components/ui/card"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { defineChart, lineY } from "@tanstack/charts"
import { Chart } from "@tanstack/charts/react"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { useMemo } from "react"
import type { DashboardOverview } from "@/features/dashboard/api/overview"
import { chartTheme } from "@/features/dashboard/components/overview/chart-frame"
import { Delta } from "@/features/dashboard/components/overview/delta"
import { formatCompact, getDelta } from "@/features/dashboard/lib/format"
import { m } from "@/paraglide/messages"

type Metric = DashboardOverview["metrics"]["reads"]

const KPIS = [
  { key: "reads", label: m.dashboard_kpi_reads, icon: Eye },
  { key: "uniqueReaders", label: m.dashboard_kpi_unique_readers, icon: Users },
  { key: "libraryAdds", label: m.dashboard_kpi_library_adds, icon: Bookmark },
  { key: "chaptersUploaded", label: m.dashboard_kpi_chapters_uploaded, icon: Upload },
  { key: "newAccounts", label: m.dashboard_kpi_new_accounts, icon: UserAdd },
] as const
const styles = stylex.create({
  row: {
    gap: "1rem",
    display: "grid",
    gridColumnEnd: "-1",
    gridColumnStart: "1",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      "@container (36rem <= width < 62rem)": "repeat(3, minmax(0, 1fr))",
      "@container (width >= 62rem)": "repeat(6, minmax(0, 1fr))",
    },
  },
  tile: {
    padding: "1.25rem",
    gap: "0.75rem",
    minWidth: 0,
  },
  label: {
    gap: "0.5rem",
    alignItems: "flex-start",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: "1.125rem",
    minHeight: "2.25rem",
  },
  icon: {
    flexShrink: 0,
    marginTop: "0.0625rem",
  },
  value: {
    fontSize: "2rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1,
  },
  meta: {
    alignItems: "center",
    display: "flex",
    minHeight: "1.25rem",
  },
  untracked: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
  spark: {
    height: "2.5rem",
    marginTop: "auto",
  },
  valueSkeleton: {
    borderRadius: radius.md,
    height: "2rem",
    width: "60%",
  },
})

export function KpiTiles({
  overview,
  compare,
}: {
  overview: DashboardOverview | undefined
  compare: boolean
}) {
  return (
    <div sx={styles.row}>
      {KPIS.map(({ key, label, icon }) => (
        <KpiTile
          compare={compare}
          icon={icon}
          key={key}
          label={label()}
          metric={overview === undefined ? undefined : overview.metrics[key]}
        />
      ))}
      <KpiTile compare={compare} icon={Comment} label={m.dashboard_kpi_comments()} metric={null} />
    </div>
  )
}

type KpiTileProps = {
  label: string
  icon: (props: IconProps) => ReactElement
  metric: Metric | null | undefined
  compare: boolean
}

function KpiTile({ label, icon: Icon, metric, compare }: KpiTileProps) {
  const delta = metric && compare ? getDelta(metric.total, metric.previousTotal) : null

  return (
    <Card render={<article />} sx={styles.tile}>
      <div sx={styles.label}>
        <Icon {...stylex.props(styles.icon)} size={16} />
        <span>{label}</span>
      </div>
      {metric === undefined ? (
        <Skeleton sx={styles.valueSkeleton} />
      ) : (
        <div sx={styles.value}>{metric === null ? "—" : formatCompact(metric.total)}</div>
      )}
      <div sx={styles.meta}>
        {metric === null ? (
          <span sx={styles.untracked}>{m.dashboard_kpi_not_tracked()}</span>
        ) : (
          <Delta value={delta} />
        )}
      </div>
      <div sx={styles.spark}>
        {metric ? (
          <Sparkline
            label={m.dashboard_kpi_trend({ label })}
            tone={
              metric.total === 0 || (delta !== null && delta < 0)
                ? colors.mutedForeground
                : colors.primary
            }
            values={metric.current}
          />
        ) : null}
      </div>
    </Card>
  )
}

function Sparkline({
  values,
  tone,
  label,
}: {
  values: readonly number[]
  tone: string
  label: string
}) {
  const definition = useMemo(() => {
    const min = Math.min(...values)
    const max = Math.max(...values)

    return defineChart({
      marks: [
        lineY(
          values.map((value, index) => ({ index, value })),
          { x: "index", y: "value", stroke: tone, strokeWidth: 2 },
        ),
      ],
      scales: {
        x: { scale: scaleLinear },
        y: {
          scale: scaleLinear().domain(
            min === max ? [Math.min(min, 0), Math.max(max, 1)] : [min, max],
          ),
        },
      },
      guides: false,
      margin: 3,
      focus: false,
      pointer: false,
      keyboard: false,
      theme: chartTheme,
    })
  }, [values, tone])

  return <Chart ariaLabel={label} definition={definition} height={40} initialWidth={160} />
}
