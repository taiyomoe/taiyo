import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement } from "react"
import * as stylex from "@stylexjs/stylex"
import { Card } from "@taiyomoe/ui/components/ui/card"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { DashboardOverview } from "@/features/dashboard/api/overview"
import { Delta } from "@/features/dashboard/components/overview/delta"
import { Sparkline } from "@/features/dashboard/components/overview/sparkline"
import { formatCompact, getDelta } from "@/features/dashboard/lib/format"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
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

type KpiTileProps = {
  label: string
  icon: (props: IconProps) => ReactElement
  metric: DashboardOverview["metrics"]["reads"] | null | undefined
  compare: boolean
}

export function KpiTile({ label, icon: Icon, metric, compare }: KpiTileProps) {
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
