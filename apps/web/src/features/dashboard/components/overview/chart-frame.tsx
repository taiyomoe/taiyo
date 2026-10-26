import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { colors, font, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { formatCompact } from "@/features/dashboard/lib/format"

export const chartTheme = {
  foreground: colors.mutedForeground,
  muted: colors.mutedForeground,
  grid: colors.border,
  background: "transparent",
  palette: [colors.chart1, colors.chart2, colors.chart3, colors.chart4, colors.chart5],
}

const gridLine = { stroke: colors.border, strokeOpacity: 1, strokeWidth: 1 }

export const countAxis = (max: number) => ({
  scale: scaleLinear().domain([0, Math.max(1, max)]),
  nice: true,
  grid: gridLine,
  axis: {
    line: false,
    ticks: { count: Math.min(4, Math.max(1, max)), size: 0, padding: 10, format: formatCompact },
  },
})

const styles = stylex.create({
  frame: {
    "--ts-chart-crosshair-label-halo": colors.card,
    "--ts-chart-crosshair-marker-fill": colors.card,
    "--ts-chart-focus-fill": colors.card,
    "--ts-chart-tooltip-active-row-background": colors.muted,
    "--ts-chart-tooltip-active-row-shadow": "none",
    "--ts-chart-tooltip-background": colors.popover,
    "--ts-chart-tooltip-border": `1px solid ${colors.border}`,
    "--ts-chart-tooltip-border-radius": radius.lg,
    "--ts-chart-tooltip-color": colors.popoverForeground,
    "--ts-chart-tooltip-font": `500 0.8125rem/1.45 ${font.sans}`,
    "--ts-chart-tooltip-padding": "0.5rem 0.75rem",
    "--ts-chart-tooltip-shadow": shadows.overlay,
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.6875rem",
    fontVariantNumeric: "tabular-nums",
    minWidth: 0,
  },
  fill: (minHeight: string) => ({
    flex: "1",
    position: "relative",
    minHeight,
  }),
})

// The chart host sizes itself from its container's height; in flow, it would grow with its own SVG.
export const fillChartStyle = { inset: 0, position: "absolute", height: "100%" } as const

export function ChartFrame({ children, fill }: { children: ReactNode; fill?: number }) {
  return <div sx={[styles.frame, fill !== undefined && styles.fill(`${fill}px`)]}>{children}</div>
}
