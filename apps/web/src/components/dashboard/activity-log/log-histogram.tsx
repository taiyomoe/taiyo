import type { AuditLogHistogramInterval } from "@taiyomoe/audit/query"
import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { barY, defineChart, stack } from "@tanstack/charts"
import { type BrushRange, type BrushXChange, brushX } from "@tanstack/charts/interaction/brush"
import { controlledSignal } from "@tanstack/charts/interaction/signal"
import { Chart } from "@tanstack/charts/react"
import { scaleBand } from "@tanstack/charts/scales/band"
import { tooltip } from "@tanstack/charts/tooltip"
import { useMemo, useState } from "react"
import type { AuditLogHistogram } from "@/lib/queries/audit-logs"
import { formatCount } from "@/components/dashboard/activity-log/format"
import {
  ChartFrame,
  chartTheme,
  countAxis,
  fillChartStyle,
} from "@/components/dashboard/overview/chart-frame"
import { pickTicks } from "@/components/dashboard/overview/format"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const OUTCOMES = ["success", "failure", "denied"] as const

export const OUTCOME_TONES: Record<(typeof OUTCOMES)[number], string> = {
  success: colors.chart2,
  failure: colors.warning,
  denied: colors.destructive,
}

const OUTCOME_LABELS: Record<(typeof OUTCOMES)[number], () => string> = {
  success: m.activity_outcome_success,
  failure: m.activity_outcome_failure,
  denied: m.activity_outcome_denied,
}
const TICK_FORMATS: Record<"time" | "day" | "month", Intl.DateTimeFormatOptions> = {
  time: { hour: "2-digit", minute: "2-digit", hourCycle: "h23" },
  day: { month: "short", day: "numeric" },
  month: { month: "short", year: "numeric" },
}
const DAY = 86_400_000
const tickKind = (interval: AuditLogHistogramInterval, spanMs: number) => {
  if (interval === "1M" || interval === "1y" || spanMs > 400 * DAY) {
    return "month"
  }

  return spanMs > 2 * DAY ? "day" : "time"
}
const styles = stylex.create({
  legend: {
    margin: 0,
    padding: 0,
    gap: "1.25rem",
    listStyle: "none",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.8125rem",
  },
  legendItem: {
    gap: "0.5rem",
    alignItems: "center",
    display: "inline-flex",
  },
  swatch: (color: string) => ({
    borderRadius: "0.1875rem",
    backgroundColor: color,
    height: "0.625rem",
    width: "0.625rem",
  }),
  hint: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    marginInlineStart: "auto",
  },
})

type LogHistogramProps = {
  histogram: AuditLogHistogram
  to: string
  onZoom: (range: { from: string; to: string }) => void
}

export function LogHistogram({ histogram, to, onZoom }: LogHistogramProps) {
  const [selection, setSelection] = useState<BrushRange<string> | null>(null)
  const { buckets, interval } = histogram
  const starts = useMemo(() => buckets.map((bucket) => bucket.start), [buckets])
  const definition = useMemo(() => {
    const first = starts[0] ?? ""
    const kind = tickKind(interval, new Date(to).getTime() - new Date(first).getTime())
    const tickFormat = new Intl.DateTimeFormat(getLocale(), TICK_FORMATS[kind])
    const titleFormat = new Intl.DateTimeFormat(getLocale(), {
      month: "short",
      day: "numeric",
      ...(interval === "1M" || interval === "1y" ? { year: "numeric" } : {}),
      ...(interval === "1d" || interval === "1w" || interval === "1M" || interval === "1y"
        ? {}
        : { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }),
    })
    const rows = buckets.flatMap((bucket) =>
      OUTCOMES.map((outcome) => ({
        id: `${bucket.start}-${outcome}`,
        bucket: bucket.start,
        outcome,
        value: bucket[outcome],
      })),
    )
    const totals = buckets.map((bucket) => bucket.success + bucket.failure + bucket.denied)

    return defineChart({
      marks: [
        barY(rows, {
          x: "bucket",
          y: "value",
          z: "outcome",
          color: "outcome",
          layout: stack(),
          radius: { end: 2 },
          maxThickness: 22,
        }),
      ],
      scales: {
        x: {
          scale: () => scaleBand().padding(0.18),
          axis: {
            line: false,
            ticks: {
              values: pickTicks(starts, 6),
              size: 0,
              padding: 10,
              format: (value) => tickFormat.format(new Date(value)),
            },
          },
        },
        y: countAxis(Math.max(0, ...totals)),
      },
      color: { domain: [...OUTCOMES], range: OUTCOMES.map((outcome) => OUTCOME_TONES[outcome]) },
      theme: chartTheme,
      focus: "group-x",
      tooltip: {
        use: tooltip,
        anchor: "group-center",
        content: (points) => ({
          ...(points[0] === undefined
            ? {}
            : { title: titleFormat.format(new Date(points[0].datum.bucket)) }),
          rows: points.map(({ datum }) => ({
            label: OUTCOME_LABELS[datum.outcome](),
            value: formatCount(datum.value),
            color: OUTCOME_TONES[datum.outcome],
          })),
        }),
      },
      controls: [
        brushX({
          range: controlledSignal<BrushRange<string>, BrushXChange<string>>(
            selection ?? { start: first, end: first },
            (next, { reason }) => {
              if (reason.type === "preview") {
                setSelection(next)

                return
              }

              setSelection(null)

              if (reason.type === "commit") {
                const end = starts.indexOf(next.end)

                onZoom({ from: next.start, to: starts[end + 1] ?? to })
              }
            },
          ),
          values: starts,
          format: (value) => titleFormat.format(new Date(value)),
          ariaLabel: m.activity_histogram_zoom(),
          startAriaLabel: m.activity_histogram_zoom_start(),
          endAriaLabel: m.activity_histogram_zoom_end(),
          handleSize: 6,
          handleStyle:
            selection === null
              ? { fillOpacity: 0, strokeOpacity: 0 }
              : { fill: colors.primary, fillOpacity: 0.85 },
          selectionStyle:
            selection === null
              ? { fillOpacity: 0, strokeOpacity: 0 }
              : {
                  fill: colors.primary,
                  fillOpacity: 0.12,
                  stroke: colors.primary,
                  strokeOpacity: 0.6,
                },
        }),
      ],
    })
  }, [buckets, interval, starts, selection, to, onZoom])

  return (
    <>
      <ChartFrame fill={180}>
        <Chart
          ariaLabel={m.activity_histogram_title()}
          definition={definition}
          style={fillChartStyle}
        />
      </ChartFrame>
      <ul sx={styles.legend}>
        {OUTCOMES.map((outcome) => (
          <li key={outcome} sx={styles.legendItem}>
            <span sx={styles.swatch(OUTCOME_TONES[outcome])} />
            {OUTCOME_LABELS[outcome]()}
          </li>
        ))}
        <li sx={styles.hint}>{m.activity_histogram_hint()}</li>
      </ul>
    </>
  )
}
