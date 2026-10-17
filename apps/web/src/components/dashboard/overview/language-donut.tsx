import * as stylex from "@stylexjs/stylex"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { defineChart } from "@tanstack/charts"
import { pie, polar, radialArc } from "@tanstack/charts/polar"
import { Chart } from "@tanstack/charts/react"
import { tooltip } from "@tanstack/charts/tooltip"
import { useMemo } from "react"
import type { DashboardOverview } from "@/lib/queries/dashboard"
import { ChartFrame, chartTheme } from "@/components/dashboard/overview/chart-frame"
import { CardNote } from "@/components/dashboard/overview/dashboard-card"
import {
  formatCompact,
  formatLanguage,
  formatNumber,
  formatPercent,
} from "@/components/dashboard/overview/format"
import { m } from "@/paraglide/messages"

const TONES = [colors.chart1, colors.chart3, colors.chart2, colors.chart5, colors.chart4]
const OTHER_TONE = `color-mix(in srgb, ${colors.mutedForeground} 45%, ${colors.card})`
const SIZE = 208
const styles = stylex.create({
  body: {
    gap: "1.5rem",
    display: "flex",
    flexDirection: "column",
  },
  donut: {
    alignSelf: "center",
    position: "relative",
    height: SIZE,
    width: SIZE,
  },
  center: {
    inset: 0,
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    pointerEvents: "none",
    position: "absolute",
  },
  total: {
    fontSize: "1.75rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  },
  totalLabel: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
  legend: {
    margin: 0,
    padding: 0,
    gap: "0.625rem",
    listStyle: "none",
    display: "grid",
  },
  row: {
    gap: "0.75rem",
    alignItems: "center",
    display: "grid",
    fontSize: "0.9375rem",
    gridTemplateColumns: "auto 1fr auto 3rem",
  },
  swatch: {
    borderRadius: "0.1875rem",
    height: "0.625rem",
    width: "0.625rem",
  },
  name: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  reads: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    fontVariantNumeric: "tabular-nums",
  },
  share: {
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    textAlign: "end",
  },
})

export function LanguageDonut({
  overview: { readsByLanguage, otherLanguageReads },
}: {
  overview: DashboardOverview
}) {
  const slices = useMemo(
    () =>
      [
        ...readsByLanguage.map(({ language, reads }, index) => ({
          id: language,
          label: formatLanguage(language),
          reads,
          tone: TONES[index] ?? OTHER_TONE,
        })),
        {
          id: "other",
          label: m.dashboard_languages_other(),
          reads: otherLanguageReads,
          tone: OTHER_TONE,
        },
      ].filter(({ reads }) => reads > 0),
    [readsByLanguage, otherLanguageReads],
  )
  const total = slices.reduce((sum, { reads }) => sum + reads, 0)
  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          polar({
            marks: [
              radialArc(pie(slices, { value: "reads" }), {
                innerRadius: ({ radius }) => radius * 0.7,
                cornerRadius: 3,
                color: "id",
                key: "id",
                stroke: colors.card,
                strokeWidth: 2,
              }),
            ],
            scales: { angle: null, radius: null },
          }),
        ],
        scales: { x: null, y: null },
        color: { domain: slices.map(({ id }) => id), range: slices.map(({ tone }) => tone) },
        margin: 0,
        theme: chartTheme,
        tooltip: {
          use: tooltip,
          content: ([point]) =>
            point === undefined
              ? { rows: [] }
              : {
                  title: point.datum.label,
                  rows: [
                    {
                      label: m.dashboard_languages_reads(),
                      value: formatNumber(point.datum.reads),
                      color: point.datum.tone,
                    },
                    {
                      label: m.dashboard_languages_share(),
                      value: formatPercent(point.datum.reads / total),
                    },
                  ],
                },
        },
      }),
    [slices, total],
  )

  if (total === 0) {
    return <CardNote>{m.dashboard_empty_reads()}</CardNote>
  }

  return (
    <div sx={styles.body}>
      <div sx={styles.donut}>
        <ChartFrame>
          <Chart
            ariaLabel={m.dashboard_languages_title()}
            definition={definition}
            height={SIZE}
            width={SIZE}
          />
        </ChartFrame>
        <div aria-hidden sx={styles.center}>
          <span sx={styles.total}>{formatCompact(total)}</span>
          <span sx={styles.totalLabel}>{m.dashboard_languages_reads_unit()}</span>
        </div>
      </div>
      <ul sx={styles.legend}>
        {slices.map(({ id, label, reads, tone }) => (
          <li key={id} sx={styles.row}>
            <span aria-hidden style={{ backgroundColor: tone }} sx={styles.swatch} />
            <span sx={styles.name}>{label}</span>
            <span sx={styles.reads}>{formatCompact(reads)}</span>
            <span sx={styles.share}>{formatPercent(reads / total)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
