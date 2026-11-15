import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { defineChart } from "@tanstack/charts"
import { pie, polar, radialArc } from "@tanstack/charts/polar"
import { Chart } from "@tanstack/charts/react"
import { tooltip } from "@tanstack/charts/tooltip"
import { useMemo } from "react"
import type { UserStats } from "@/features/users/api/profile"
import { ChartFrame, chartTheme } from "@/features/dashboard/components/overview/chart-frame"
import { getTagName } from "@/features/media-suggestions/lib/media-edit-labels"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const SHOWN_GENRES = 7
const TONES = [
  colors.chart1,
  colors.chart2,
  colors.chart3,
  colors.chart4,
  colors.chart5,
  `color-mix(in srgb, ${colors.chart1} 55%, ${colors.chart3})`,
  `color-mix(in srgb, ${colors.chart2} 55%, ${colors.chart4})`,
]
const OTHER_TONE = `color-mix(in srgb, ${colors.mutedForeground} 45%, ${colors.card})`
const SIZE = 196
const styles = stylex.create({
  body: {
    gap: "1.75rem",
    alignItems: "center",
    display: "flex",
    flexDirection: { default: "column", [breakpoints.sm]: "row" },
  },
  donut: {
    flexShrink: 0,
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
    fontFamily: font.mono,
    fontSize: "1.625rem",
    fontVariantNumeric: "tabular-nums",
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
    flexGrow: 1,
    minWidth: 0,
    width: "100%",
  },
  row: {
    gap: "0.75rem",
    alignItems: "center",
    display: "grid",
    fontSize: "0.9375rem",
    gridTemplateColumns: "auto minmax(0, 1fr) auto 3rem",
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
  count: {
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
const formatCount = (value: number) => new Intl.NumberFormat(getLocale()).format(value)
const formatShare = (value: number) =>
  new Intl.NumberFormat(getLocale(), { style: "percent", maximumFractionDigits: 0 }).format(value)

export function GenreDonut({ genres }: { genres: NonNullable<UserStats["reading"]>["genres"] }) {
  const slices = useMemo(() => {
    const shown = genres.slice(0, SHOWN_GENRES).map(({ genre, count }, index) => ({
      id: genre,
      label: getTagName(genre),
      count,
      tone: TONES[index] ?? OTHER_TONE,
    }))
    const rest = genres.slice(SHOWN_GENRES).reduce((sum, { count }) => sum + count, 0)

    return rest === 0
      ? shown
      : [
          ...shown,
          { id: "other", label: m.profile_stats_genres_other(), count: rest, tone: OTHER_TONE },
        ]
  }, [genres])
  const total = slices.reduce((sum, { count }) => sum + count, 0)
  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          polar({
            marks: [
              radialArc(pie(slices, { value: "count" }), {
                innerRadius: ({ radius }) => radius * 0.68,
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
                      label: m.profile_stats_genres_titles(),
                      value: formatCount(point.datum.count),
                      color: point.datum.tone,
                    },
                    {
                      label: m.profile_stats_genres_share(),
                      value: formatShare(point.datum.count / total),
                    },
                  ],
                },
        },
      }),
    [slices, total],
  )

  return (
    <div sx={styles.body}>
      <div sx={styles.donut}>
        <ChartFrame>
          <Chart
            ariaLabel={m.profile_stats_genres()}
            definition={definition}
            height={SIZE}
            width={SIZE}
          />
        </ChartFrame>
        <div aria-hidden sx={styles.center}>
          <span sx={styles.total}>{formatCount(genres.length)}</span>
          <span sx={styles.totalLabel}>{m.profile_stats_genres_unit()}</span>
        </div>
      </div>
      <ul sx={styles.legend}>
        {slices.map(({ id, label, count, tone }) => (
          <li key={id} sx={styles.row}>
            <span aria-hidden style={{ backgroundColor: tone }} sx={styles.swatch} />
            <span sx={styles.name} title={label}>
              {label}
            </span>
            <span sx={styles.count}>{formatCount(count)}</span>
            <span sx={styles.share}>{formatShare(count / total)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
