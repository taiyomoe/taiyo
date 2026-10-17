import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { areaY, defineChart, lineY } from "@tanstack/charts"
import { crosshair } from "@tanstack/charts/crosshair"
import { decorative } from "@tanstack/charts/mark/decorative"
import { Chart } from "@tanstack/charts/react"
import { scalePoint } from "@tanstack/charts/scales/point"
import { tooltip } from "@tanstack/charts/tooltip"
import { useMemo } from "react"
import type { DashboardOverview } from "@/lib/queries/dashboard"
import {
  ChartFrame,
  chartTheme,
  fillChartStyle,
  countAxis,
} from "@/components/dashboard/overview/chart-frame"
import {
  formatBucketTick,
  formatBucketTitle,
  formatNumber,
  pickTicks,
} from "@/components/dashboard/overview/format"
import { m } from "@/paraglide/messages"

type TrendChartProps = {
  overview: DashboardOverview
  metric: DashboardOverview["metrics"]["reads"]
  compare: boolean
  tone: string
  label: string
  minHeight: number
  ticks: number
}

export function TrendChart({
  overview: { buckets, unit },
  metric,
  compare,
  tone,
  label,
  minHeight,
  ticks,
}: TrendChartProps) {
  const definition = useMemo(() => {
    const rows = buckets.map((bucket, index) => ({
      bucket,
      current: metric.current[index] ?? 0,
      previous: metric.previous[index] ?? 0,
    }))

    return defineChart({
      marks: [
        decorative(areaY(rows, { x: "bucket", y: "current", fill: "url(#trend)", fillOpacity: 1 })),
        ...(compare
          ? [
              lineY(rows, {
                id: "previous",
                x: "bucket",
                y: "previous",
                stroke: colors.mutedForeground,
                strokeDasharray: "4 4",
                strokeOpacity: 0.8,
                strokeWidth: 1.5,
              }),
            ]
          : []),
        lineY(rows, { id: "current", x: "bucket", y: "current", stroke: tone, strokeWidth: 2 }),
        crosshair({ y: false }),
      ],
      scales: {
        x: {
          scale: scalePoint,
          axis: {
            line: false,
            ticks: {
              values: pickTicks(buckets, ticks),
              size: 0,
              padding: 10,
              format: (value) => formatBucketTick(value, unit),
            },
          },
        },
        y: countAxis(
          Math.max(
            ...rows.map((row) => (compare ? Math.max(row.current, row.previous) : row.current)),
          ),
        ),
      },
      gradients: [
        {
          id: "trend",
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 1,
          stops: [
            { offset: 0, color: tone, opacity: 0.22 },
            { offset: 1, color: tone, opacity: 0 },
          ],
        },
      ],
      theme: chartTheme,
      focus: "group-x",
      maxFocusDistance: Number.POSITIVE_INFINITY,
      tooltip: {
        use: tooltip,
        anchor: "group-center",
        content: (points) => {
          const row = points[0]?.datum

          return row === undefined
            ? { rows: [] }
            : {
                title: formatBucketTitle(row.bucket, unit),
                rows: [
                  {
                    label: m.dashboard_this_period(),
                    value: formatNumber(row.current),
                    color: tone,
                  },
                  ...(compare
                    ? [
                        {
                          label: m.dashboard_previous_period(),
                          value: formatNumber(row.previous),
                          color: colors.mutedForeground,
                        },
                      ]
                    : []),
                ],
              }
        },
      },
    })
  }, [buckets, unit, metric, compare, tone, ticks])

  return (
    <ChartFrame fill={minHeight}>
      <Chart ariaLabel={label} definition={definition} style={fillChartStyle} />
    </ChartFrame>
  )
}
