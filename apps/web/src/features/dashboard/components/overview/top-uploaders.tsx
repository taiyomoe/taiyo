import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { barX, defineChart, text, tickX } from "@tanstack/charts"
import { decorative } from "@tanstack/charts/mark/decorative"
import { Chart } from "@tanstack/charts/react"
import { scaleBand } from "@tanstack/charts/scales/band"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { tooltip } from "@tanstack/charts/tooltip"
import { useMemo } from "react"
import type { DashboardOverview } from "@/features/dashboard/api/overview"
import { CardNote } from "@/features/dashboard/components/overview/card-note"
import { ChartFrame, chartTheme } from "@/features/dashboard/components/overview/chart-frame"
import { formatCompact, formatNumber } from "@/features/dashboard/lib/format"
import { m } from "@/paraglide/messages"

const ROW_HEIGHT = 36

export function TopUploaders({
  overview: { topUploaders },
  compare,
  tone,
  previousTone,
}: {
  overview: DashboardOverview
  compare: boolean
  tone: string
  previousTone: string
}) {
  const definition = useMemo(() => {
    const names = new Map(topUploaders.map((uploader) => [uploader.id, uploader.displayUsername]))
    const reach = (uploader: (typeof topUploaders)[number]) =>
      compare ? Math.max(uploader.chapters, uploader.previousChapters) : uploader.chapters

    return defineChart({
      marks: [
        barX(topUploaders, {
          x: "chapters",
          y: "id",
          fill: tone,
          radius: { end: 4 },
          maxThickness: 18,
        }),
        ...(compare
          ? [
              decorative(
                tickX(topUploaders, {
                  x: "previousChapters",
                  y: "id",
                  stroke: previousTone,
                  strokeWidth: 2.5,
                  span: 0.62,
                }),
              ),
            ]
          : []),
        decorative(
          text(topUploaders, {
            x: reach,
            y: "id",
            text: (uploader) => formatCompact(uploader.chapters),
            anchor: "start",
            dx: 8,
            fontWeight: 600,
            fill: colors.foreground,
          }),
        ),
      ],
      scales: {
        x: { scale: scaleLinear, axis: false },
        y: {
          scale: () => scaleBand().padding(0.3),
          axis: {
            line: false,
            ticks: { size: 0, padding: 12, format: (id) => names.get(id) ?? id },
            tickLabels: { fontSize: 13 },
          },
        },
      },
      theme: { ...chartTheme, foreground: colors.foreground },
      tooltip: {
        use: tooltip,
        content: ([point]) =>
          point === undefined
            ? { rows: [] }
            : {
                title: point.datum.displayUsername,
                rows: [
                  {
                    label: m.dashboard_this_period(),
                    value: formatNumber(point.datum.chapters),
                    color: tone,
                  },
                  ...(compare
                    ? [
                        {
                          label: m.dashboard_previous_period(),
                          value: formatNumber(point.datum.previousChapters),
                          color: previousTone,
                        },
                      ]
                    : []),
                ],
              },
      },
    })
  }, [topUploaders, compare, tone, previousTone])

  if (topUploaders.length === 0) {
    return <CardNote>{m.dashboard_empty_uploads()}</CardNote>
  }

  return (
    <ChartFrame>
      <Chart
        ariaLabel={m.dashboard_uploaders_title()}
        definition={definition}
        height={topUploaders.length * ROW_HEIGHT + 8}
      />
    </ChartFrame>
  )
}
