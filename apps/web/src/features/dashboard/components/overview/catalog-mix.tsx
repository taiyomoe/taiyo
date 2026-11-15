import * as stylex from "@stylexjs/stylex"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { barX, defineChart } from "@tanstack/charts"
import { Chart } from "@tanstack/charts/react"
import { scaleBand } from "@tanstack/charts/scales/band"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { tooltip } from "@tanstack/charts/tooltip"
import { useMemo } from "react"
import type { DashboardOverview } from "@/features/dashboard/api/overview"
import { CardNote } from "@/features/dashboard/components/overview/card-note"
import { ChartFrame, chartTheme } from "@/features/dashboard/components/overview/chart-frame"
import { formatCompact, formatNumber, formatPercent } from "@/features/dashboard/lib/format"
import { m } from "@/paraglide/messages"

type MediaType = DashboardOverview["catalogMix"][number]["type"]

const TYPES: Record<MediaType, { label: () => string; tone: string }> = {
  MANGA: { label: m.dashboard_type_manga, tone: colors.chart1 },
  MANHWA: { label: m.dashboard_type_manhwa, tone: colors.chart5 },
  MANHUA: { label: m.dashboard_type_manhua, tone: colors.chart3 },
  LIGHT_NOVEL: { label: m.dashboard_type_light_novel, tone: colors.chart2 },
  OTHER: { label: m.dashboard_type_other, tone: colors.chart4 },
}
const styles = stylex.create({
  body: {
    gap: "1.5rem",
    display: "flex",
    flexDirection: "column",
  },
  legend: {
    margin: 0,
    padding: 0,
    gap: "0.75rem",
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
  count: {
    fontFamily: font.mono,
    fontSize: "0.875rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
  },
  share: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    fontVariantNumeric: "tabular-nums",
    textAlign: "end",
  },
})

export function CatalogMix({ overview: { catalogMix } }: { overview: DashboardOverview }) {
  const total = catalogMix.reduce((sum, { count }) => sum + count, 0)
  const definition = useMemo(() => {
    const rows = catalogMix
      .filter(({ count }) => count > 0)
      .map(({ type, count }) => ({ id: type, type, count, label: TYPES[type].label() }))

    return defineChart({
      marks: [
        barX(rows, {
          x: "count",
          y: () => "catalog",
          color: "type",
          radius: 4,
          stroke: colors.card,
          strokeWidth: 3,
        }),
      ],
      scales: {
        x: { scale: scaleLinear },
        y: { scale: () => scaleBand().padding(0) },
      },
      color: {
        domain: rows.map(({ type }) => type),
        range: rows.map(({ type }) => TYPES[type].tone),
      },
      guides: false,
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
                    label: m.dashboard_catalog_titles(),
                    value: formatNumber(point.datum.count),
                    color: TYPES[point.datum.type].tone,
                  },
                  {
                    label: m.dashboard_languages_share(),
                    value: formatPercent(point.datum.count / total),
                  },
                ],
              },
      },
    })
  }, [catalogMix, total])

  if (total === 0) {
    return <CardNote>{m.dashboard_empty_catalog()}</CardNote>
  }

  return (
    <div sx={styles.body}>
      <ChartFrame>
        <Chart ariaLabel={m.dashboard_catalog_title()} definition={definition} height={16} />
      </ChartFrame>
      <ul sx={styles.legend}>
        {catalogMix.map(({ type, count }) => (
          <li key={type} sx={styles.row}>
            <span aria-hidden style={{ backgroundColor: TYPES[type].tone }} sx={styles.swatch} />
            <span>{TYPES[type].label()}</span>
            <span sx={styles.count}>{formatCompact(count)}</span>
            <span sx={styles.share}>{formatPercent(count / total)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
