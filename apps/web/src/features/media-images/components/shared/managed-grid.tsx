import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors, font } from "@taiyomoe/ui/styles/tokens.stylex"

const styles = stylex.create({
  section: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    minHeight: "2.25rem",
  },
  title: {
    margin: 0,
    fontSize: "1.0625rem",
    fontWeight: 600,
  },
  count: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
  },
  actions: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    marginInlineStart: "auto",
  },
  grid: {
    margin: 0,
    padding: 0,
    gap: "1rem",
    listStyle: "none",
    display: "grid",
  },
  covers: {
    gridTemplateColumns: {
      default: "repeat(auto-fill, minmax(8.5rem, 1fr))",
      [breakpoints.sm]: "repeat(auto-fill, minmax(10rem, 1fr))",
    },
  },
  banners: {
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.xl]: "repeat(2, minmax(0, 1fr))",
    },
  },
})

export function ManagedGrid({
  title,
  count,
  kind,
  actions,
  children,
}: {
  title: string
  count: number
  kind: "cover" | "banner"
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <section sx={styles.section}>
      <header sx={styles.header}>
        <h2 sx={styles.title}>{title}</h2>
        <span sx={styles.count}>{count}</span>
        {actions === undefined ? null : <div sx={styles.actions}>{actions}</div>}
      </header>
      <ul sx={[styles.grid, kind === "cover" ? styles.covers : styles.banners]}>{children}</ul>
    </section>
  )
}
