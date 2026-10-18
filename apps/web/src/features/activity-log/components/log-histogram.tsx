import { Chart } from "@tanstack/charts/react"
import type { AuditLogHistogram } from "@/features/activity-log/api/audit-logs"
import { HistogramLegend } from "@/features/activity-log/components/histogram/histogram-legend"
import { useHistogramChart } from "@/features/activity-log/hooks/use-histogram-chart"
import { ChartFrame, fillChartStyle } from "@/features/dashboard/components/overview/chart-frame"
import { m } from "@/paraglide/messages"

export function LogHistogram({
  histogram,
  to,
  onZoom,
}: {
  histogram: AuditLogHistogram
  to: string
  onZoom: (range: { from: string; to: string }) => void
}) {
  const definition = useHistogramChart({ histogram, to, onZoom })

  return (
    <>
      <ChartFrame fill={180}>
        <Chart
          ariaLabel={m.activity_histogram_title()}
          definition={definition}
          style={fillChartStyle}
        />
      </ChartFrame>
      <HistogramLegend />
    </>
  )
}
