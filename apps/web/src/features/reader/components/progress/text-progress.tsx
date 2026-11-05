import * as stylex from "@stylexjs/stylex"
import { font, radius } from "@taiyomoe/ui/styles/tokens.stylex"

const styles = stylex.create({
  pill: {
    borderRadius: radius.full,
    marginInline: "auto",
    paddingBlock: "0.25rem",
    paddingInline: "0.75rem",
    backdropFilter: "blur(8px)",
    backgroundColor: "rgb(0 0 0 / 56%)",
    color: "rgb(255 255 255 / 88%)",
    fontFamily: font.mono,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
    marginBottom: "0.75rem",
    width: "fit-content",
  },
})

export function TextProgress({ label }: { label: string }) {
  return <div sx={styles.pill}>{label}</div>
}
