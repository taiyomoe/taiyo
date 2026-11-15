import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"

const styles = stylex.create({
  figure: {
    gap: "0.125rem",
    alignItems: "flex-end",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  figureValue: {
    fontSize: "1.75rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1,
  },
})

export function CardFigure({ value, children }: { value: string; children?: ReactNode }) {
  return (
    <div sx={styles.figure}>
      <span sx={styles.figureValue}>{value}</span>
      {children}
    </div>
  )
}
