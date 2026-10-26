import { barY, defineChart, group } from "@tanstack/charts"
import { Chart } from "@tanstack/charts/react"
import { scaleBand } from "@tanstack/charts/scales/band"
import { tooltip } from "@tanstack/charts/tooltip"
import { useMemo } from "react"
import type { DashboardOverview } from "@/features/dashboard/api/overview"
import {
  ChartFrame,
  chartTheme,
  fillChartStyle,
  countAxis,
} from "@/features/dashboard/components/overview/chart-frame"
import {
  formatBucketTick,
  formatBucketTitle,
  formatNumber,
  pickTicks,
} from "@/features/dashboard/lib/format"
import { m } from "@/paraglide/messages"

type ChaptersChartProps = {
  overview: DashboardOverview
  compare: boolean
  tone: string
  previousTone: string
}

export function ChaptersChart({
  overview: { buckets, unit, metrics },
  compare,
  tone,
  previousTone,
}: ChaptersChartProps) {
  const definition = useMemo(() => {
    const metric = metrics.chaptersUploaded
    const rows = buckets.flatMap((bucket, index) => [
      ...(compare
        ? [
            {
              id: `${bucket}-previous`,
              bucket,
              period: "previous",
              value: metric.previous[index] ?? 0,
            },
          ]
        : []),
      { id: `${bucket}-current`, bucket, period: "current", value: metric.current[index] ?? 0 },
    ])

    return defineChart({
      marks: [
        barY(rows, {
          x: "bucket",
          y: "value",
          z: "period",
          color: "period",
          layout: group({ padding: 0.1 }),
          radius: { end: 3 },
          maxThickness: 14,
        }),
      ],
      scales: {
        x: {
          scale: () => scaleBand().padding(0.24),
          axis: {
            line: false,
            ticks: {
              values: pickTicks(buckets, 6),
              size: 0,
              padding: 10,
              format: (value) => formatBucketTick(value, unit),
            },
          },
        },
        y: countAxis(Math.max(...rows.map((row) => row.value))),
      },
      color: { domain: ["previous", "current"], range: [previousTone, tone] },
      theme: chartTheme,
      focus: "group-x",
      tooltip: {
        use: tooltip,
        anchor: "group-center",
        content: (points) => ({
          ...(points[0] === undefined
            ? {}
            : { title: formatBucketTitle(points[0].datum.bucket, unit) }),
          rows: points.map(({ datum }) => ({
            label:
              datum.period === "current"
                ? m.dashboard_this_period()
                : m.dashboard_previous_period(),
            value: formatNumber(datum.value),
            color: datum.period === "current" ? tone : previousTone,
          })),
        }),
      },
    })
  }, [buckets, unit, metrics, compare, tone, previousTone])

  return (
    <ChartFrame fill={260}>
      <Chart
        ariaLabel={m.dashboard_chapters_title()}
        definition={definition}
        style={fillChartStyle}
      />
    </ChartFrame>
  )
}
