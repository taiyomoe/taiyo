import type { Sx } from "@taiyomoe/ui/styles/sx"
import type { DashboardOverview } from "@/features/dashboard/api/overview"
import { CardSkeleton } from "@/features/dashboard/components/overview/card-skeleton"
import { DashboardCard } from "@/features/dashboard/components/overview/dashboard-card"
import { MetricChart } from "@/features/dashboard/components/overview/metric-chart"
import { MetricFigure } from "@/features/dashboard/components/overview/metric-figure"
import { PeriodLegend } from "@/features/dashboard/components/overview/period-legend"
import { TrendChart } from "@/features/dashboard/components/overview/trend-chart"

export function TrendCard({
  overview,
  metric,
  compare,
  title,
  subtitle,
  empty,
  minHeight,
  ticks,
  tone,
  sx,
}: {
  overview: DashboardOverview | undefined
  metric: "reads" | "newAccounts"
  compare: boolean
  title: string
  subtitle: string
  empty: string
  minHeight: number
  ticks: number
  tone: string
  sx: Sx
}) {
  return (
    <DashboardCard
      figure={<MetricFigure compare={compare} metric={overview?.metrics[metric]} />}
      subtitle={subtitle}
      sx={sx}
      title={title}
    >
      {overview === undefined ? (
        <CardSkeleton />
      ) : (
        <MetricChart empty={empty} metric={overview.metrics[metric]}>
          <TrendChart
            compare={compare}
            minHeight={minHeight}
            label={title}
            metric={overview.metrics[metric]}
            overview={overview}
            ticks={ticks}
            tone={tone}
          />
          {compare ? <PeriodLegend shape="line" tone={tone} /> : null}
        </MetricChart>
      )}
    </DashboardCard>
  )
}
