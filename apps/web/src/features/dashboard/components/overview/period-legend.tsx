import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  legend: {
    margin: 0,
    padding: 0,
    gap: "1.5rem",
    listStyle: "none",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.8125rem",
  },
  item: {
    gap: "0.5rem",
    alignItems: "center",
    display: "inline-flex",
  },
  line: {
    borderTopStyle: "solid",
    borderTopWidth: 2,
    width: "1.125rem",
  },
  dashed: {
    borderTopStyle: "dashed",
  },
  bar: {
    borderRadius: "0.1875rem",
    height: "0.625rem",
    width: "0.625rem",
  },
  tick: {
    borderRadius: "1px",
    height: "0.75rem",
    width: "0.1875rem",
  },
})
const SWATCHES = {
  line: { current: styles.line, previous: [styles.line, styles.dashed] },
  bar: { current: styles.bar, previous: styles.bar },
  bullet: { current: styles.bar, previous: styles.tick },
}

export function PeriodLegend({
  tone,
  previousTone = colors.mutedForeground,
  shape,
}: {
  tone: string
  previousTone?: string
  shape: keyof typeof SWATCHES
}) {
  const periods = [
    { key: "current", color: tone, label: m.dashboard_this_period() },
    { key: "previous", color: previousTone, label: m.dashboard_previous_period() },
  ] as const

  return (
    <ul sx={styles.legend}>
      {periods.map(({ key, color, label }) => (
        <li key={key} sx={styles.item}>
          <span
            aria-hidden
            style={shape === "line" ? { borderTopColor: color } : { backgroundColor: color }}
            sx={SWATCHES[shape][key]}
          />
          {label}
        </li>
      ))}
    </ul>
  )
}
