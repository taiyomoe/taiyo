import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"

const styles = stylex.create({
  grid: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    columnGap: { default: "0.875rem", [breakpoints.sm]: "1.25rem" },
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(auto-fill, minmax(7.5rem, 1fr))",
      [breakpoints.sm]: "repeat(auto-fill, minmax(9.5rem, 1fr))",
    },
    rowGap: { default: "1.25rem", [breakpoints.sm]: "1.75rem" },
  },
  item: {
    minWidth: 0,
  },
})

export function CoverGrid({ children }: { children: ReactNode }) {
  return <ul sx={styles.grid}>{children}</ul>
}

export function CoverGridItem({ children }: { children: ReactNode }) {
  return <li sx={styles.item}>{children}</li>
}
