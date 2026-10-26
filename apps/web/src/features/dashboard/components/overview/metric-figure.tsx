import type { DashboardOverview } from "@/features/dashboard/api/overview"
import { CardFigure } from "@/features/dashboard/components/overview/card-figure"
import { Delta } from "@/features/dashboard/components/overview/delta"
import { formatCompact, getDelta } from "@/features/dashboard/lib/format"

type MetricFigureProps = {
  metric: DashboardOverview["metrics"]["reads"] | undefined
  compare: boolean
}

export function MetricFigure({ metric, compare }: MetricFigureProps) {
  if (metric === undefined) {
    return null
  }

  return (
    <CardFigure value={formatCompact(metric.total)}>
      {compare ? <Delta value={getDelta(metric.total, metric.previousTotal)} /> : null}
    </CardFigure>
  )
}
