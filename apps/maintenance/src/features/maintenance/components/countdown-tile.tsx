import * as stylex from "@stylexjs/stylex"
import { scene } from "@taiyomoe/ui/styles/scene.stylex"
import { font } from "@taiyomoe/ui/styles/tokens.stylex"

const styles = stylex.create({
  tile: {
    borderColor: `color-mix(in srgb, ${scene.goldPale} 12%, transparent)`,
    borderRadius: "25px",
    borderStyle: "solid",
    borderWidth: "1px",
    gap: "0.5rem",
    paddingInline: "1rem",
    alignItems: "center",
    backdropFilter: "blur(8px)",
    backgroundColor: `color-mix(in srgb, ${scene.nightRaised} 72%, transparent)`,
    boxShadow: "inset 0 1px rgba(255, 255, 255, 0.06), 0 16px 40px -16px rgba(0, 0, 0, 0.6)",
    display: "flex",
    flexDirection: "column",
    minWidth: "clamp(6rem, 12vw, 9.25rem)",
    paddingBottom: "1rem",
    paddingTop: "1.25rem",
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

export const CountdownTile = ({ value, label }: { value: number; label: string }) => (
  <div sx={styles.tile}>
    <span sx={styles.value}>{String(value).padStart(2, "0")}</span>
    <span sx={styles.label}>{label}</span>
  </div>
)
