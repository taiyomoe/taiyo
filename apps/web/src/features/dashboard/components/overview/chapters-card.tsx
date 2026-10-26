import type { Sx } from "@taiyomoe/ui/styles/sx"
import type { DashboardOverview } from "@/features/dashboard/api/overview"
import { CardSkeleton } from "@/features/dashboard/components/overview/card-skeleton"
import { ChaptersChart } from "@/features/dashboard/components/overview/chapters-chart"
import { DashboardCard } from "@/features/dashboard/components/overview/dashboard-card"
import { MetricChart } from "@/features/dashboard/components/overview/metric-chart"
import { MetricFigure } from "@/features/dashboard/components/overview/metric-figure"
import { PeriodLegend } from "@/features/dashboard/components/overview/period-legend"
import { m } from "@/paraglide/messages"

type ChaptersCardProps = {
  overview: DashboardOverview | undefined
  compare: boolean
  subtitle: string
  tone: string
  previousTone: string
  sx: Sx
}

export function ChaptersCard({
  overview,
  compare,
  subtitle,
  tone,
  previousTone,
  sx,
}: ChaptersCardProps) {
  return (
    <DashboardCard
      figure={<MetricFigure compare={compare} metric={overview?.metrics.chaptersUploaded} />}
      subtitle={subtitle}
      sx={sx}
      title={m.dashboard_chapters_title()}
    >
      {overview === undefined ? (
        <CardSkeleton />
      ) : (
        <MetricChart empty={m.dashboard_empty_uploads()} metric={overview.metrics.chaptersUploaded}>
          <ChaptersChart
            compare={compare}
            overview={overview}
            previousTone={previousTone}
            tone={tone}
          />
          {compare ? <PeriodLegend previousTone={previousTone} shape="bar" tone={tone} /> : null}
        </MetricChart>
      )}
    </DashboardCard>
  )
}
