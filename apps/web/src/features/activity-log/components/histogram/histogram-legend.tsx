import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { OUTCOME_LABELS, OUTCOME_TONES, OUTCOMES } from "@/features/activity-log/lib/outcomes"
import { m } from "@/paraglide/messages"

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

export function HistogramLegend() {
  return (
    <ul sx={styles.legend}>
      {OUTCOMES.map((outcome) => (
        <li key={outcome} sx={styles.legendItem}>
          <span sx={styles.swatch(OUTCOME_TONES[outcome])} />
          {OUTCOME_LABELS[outcome]()}
        </li>
      ))}
      <li sx={styles.hint}>{m.activity_histogram_hint()}</li>
    </ul>
  )
}
