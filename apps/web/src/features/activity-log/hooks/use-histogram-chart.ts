import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { barY, defineChart, stack } from "@tanstack/charts"
import { type BrushRange, type BrushXChange, brushX } from "@tanstack/charts/interaction/brush"
import { controlledSignal } from "@tanstack/charts/interaction/signal"
import { scaleBand } from "@tanstack/charts/scales/band"
import { tooltip } from "@tanstack/charts/tooltip"
import { useMemo, useState } from "react"
import type { AuditLogHistogram } from "@/features/activity-log/api/audit-logs"
import { formatCount } from "@/features/activity-log/lib/format"
import { OUTCOME_LABELS, OUTCOME_TONES, OUTCOMES } from "@/features/activity-log/lib/outcomes"
import { chartTheme, countAxis } from "@/features/dashboard/components/overview/chart-frame"
import { pickTicks } from "@/features/dashboard/lib/format"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const TICK_FORMATS: Record<"time" | "day" | "month", Intl.DateTimeFormatOptions> = {
  time: { hour: "2-digit", minute: "2-digit", hourCycle: "h23" },
  day: { month: "short", day: "numeric" },
  month: { month: "short", year: "numeric" },
}
const DAY = 86_400_000

export function useHistogramChart({
  histogram,
  to,
  onZoom,
}: {
  histogram: AuditLogHistogram
  to: string
  onZoom: (range: { from: string; to: string }) => void
}) {
  const [selection, setSelection] = useState<BrushRange<string> | null>(null)
  const { buckets, interval } = histogram
  const starts = useMemo(() => buckets.map((bucket) => bucket.start), [buckets])

  return useMemo(() => {
    const first = starts[0] ?? ""
    const spanMs = new Date(to).getTime() - new Date(first).getTime()
    let kind: keyof typeof TICK_FORMATS = "time"

    if (interval === "1M" || interval === "1y" || spanMs > 400 * DAY) {
      kind = "month"
    } else if (spanMs > 2 * DAY) {
      kind = "day"
    }

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
}
