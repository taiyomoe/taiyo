import * as stylex from "@stylexjs/stylex"
import { colors, containers } from "@taiyomoe/ui/styles/tokens.stylex"
import { cell, defineChart } from "@tanstack/charts"
import { Chart } from "@tanstack/charts/react"
import { scaleBand } from "@tanstack/charts/scales/band"
import { tooltip } from "@tanstack/charts/tooltip"
import { useMemo } from "react"
import { chunk, range, sum } from "remeda"
import type { DashboardOverview } from "@/features/dashboard/api/overview"
import { CardNote } from "@/features/dashboard/components/overview/card-note"
import { ChartFrame, chartTheme } from "@/features/dashboard/components/overview/chart-frame"
import { formatNumber } from "@/features/dashboard/lib/format"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const LEVELS = [
  `color-mix(in srgb, ${colors.primary} 7%, ${colors.card})`,
  `color-mix(in srgb, ${colors.primary} 28%, ${colors.card})`,
  `color-mix(in srgb, ${colors.primary} 52%, ${colors.card})`,
  `color-mix(in srgb, ${colors.primary} 76%, ${colors.card})`,
  colors.primary,
]
const styles = stylex.create({
  body: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  hourly: {
    display: {
      default: "none",
      [containers["2xl"]]: "block",
    },
  },
  compact: {
    display: {
      default: "block",
      [containers["2xl"]]: "none",
    },
  },
  scale: {
    gap: "0.375rem",
    alignItems: "center",
    alignSelf: "flex-end",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.8125rem",
  },
  step: {
    borderRadius: "0.1875rem",
    height: "0.75rem",
    width: "0.75rem",
  },
})
const getWeekdays = () => {
  const format = new Intl.DateTimeFormat(getLocale(), { weekday: "short", timeZone: "UTC" })

  return range(0, 7).map((day) => format.format(Date.UTC(2024, 0, 1 + day)))
}
const toHour = (hour: number) => String(hour).padStart(2, "0")
const useHeatmapDefinition = (readingHours: DashboardOverview["readingHours"], span: number) =>
  useMemo(() => {
    const weekdays = getWeekdays()
    const slots = range(0, 24 / span).map((slot) => toHour(slot * span))
    const days = readingHours.map((hours) => chunk(hours, span).map((block) => sum(block)))
    const max = Math.max(0, ...days.flat())
    const rows = days.flatMap((blocks, day) =>
      blocks.map((reads, slot) => ({
        id: `${day}-${slot}`,
        day: weekdays[day] ?? String(day),
        from: toHour(slot * span),
        to: toHour((slot + 1) * span),
        reads,
        level: reads === 0 || max === 0 ? 0 : Math.max(1, Math.ceil((reads / max) * 4)),
      })),
    )

    return defineChart({
      marks: [cell(rows, { x: "from", y: "day", color: "level", inset: 2, radius: 4 })],
      scales: {
        x: {
          scale: () => scaleBand().domain(slots).padding(0),
          axis: {
            line: false,
            ticks: { values: ["00", "06", "12", "18"], size: 0, padding: 8 },
            tickLabels: { anchor: "start", dx: ({ bandwidth }) => -bandwidth / 2 + 2 },
          },
        },
        y: {
          scale: () => scaleBand().domain(weekdays).padding(0),
          axis: { line: false, ticks: { size: 0, padding: 10 } },
        },
      },
      color: { domain: [0, 1, 2, 3, 4], range: LEVELS },
      theme: chartTheme,
      tooltip: {
        use: tooltip,
        content: ([point]) =>
          point === undefined
            ? { rows: [] }
            : {
                title:
                  span === 1
                    ? m.dashboard_heatmap_slot({ day: point.datum.day, hour: point.datum.from })
                    : m.dashboard_heatmap_span({
                        day: point.datum.day,
                        from: point.datum.from,
                        to: point.datum.to,
                      }),
                rows: [
                  {
                    label: m.dashboard_languages_reads(),
                    value: formatNumber(point.datum.reads),
                    color: LEVELS[point.datum.level] ?? colors.primary,
                  },
                ],
              },
      },
    })
  }, [readingHours, span])

export function ReadingHeatmap({ overview: { readingHours } }: { overview: DashboardOverview }) {
  const hourly = useHeatmapDefinition(readingHours, 1)
  const compact = useHeatmapDefinition(readingHours, 2)

  if (readingHours.every((hours) => hours.every((reads) => reads === 0))) {
    return <CardNote>{m.dashboard_empty_reads()}</CardNote>
  }

  return (
    <div sx={styles.body}>
      <div sx={styles.hourly}>
        <ChartFrame>
          <Chart ariaLabel={m.dashboard_heatmap_title()} aspectRatio={3.2} definition={hourly} />
        </ChartFrame>
      </div>
      <div sx={styles.compact}>
        <ChartFrame>
          <Chart ariaLabel={m.dashboard_heatmap_title()} aspectRatio={1.6} definition={compact} />
        </ChartFrame>
      </div>
      <div aria-hidden sx={styles.scale}>
        {m.dashboard_heatmap_less()}
        {LEVELS.map((level) => (
          <span key={level} style={{ backgroundColor: level }} sx={styles.step} />
        ))}
        {m.dashboard_heatmap_more()}
      </div>
    </div>
  )
}
