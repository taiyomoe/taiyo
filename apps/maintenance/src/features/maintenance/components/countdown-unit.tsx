import * as stylex from "@stylexjs/stylex"
import { scene } from "@taiyomoe/ui/styles/scene.stylex"
import { font } from "@taiyomoe/ui/styles/tokens.stylex"

const styles = stylex.create({
  unit: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    minWidth: "clamp(5rem, 9vw, 8rem)",
  },
  value: {
    color: scene.goldLight,
    fontFamily: font.mono,
    fontSize: "clamp(2.5rem, 5.6vw, 4.5rem)",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 500,
    letterSpacing: "-0.03em",
    lineHeight: 1,
  },
  label: {
    color: `color-mix(in srgb, ${scene.paper} 60%, transparent)`,
    fontSize: "0.75rem",
  },
})

export const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
  <div sx={styles.unit}>
    <span sx={styles.value}>{String(value).padStart(2, "0")}</span>
    <span sx={styles.label}>{label}</span>
  </div>
)
