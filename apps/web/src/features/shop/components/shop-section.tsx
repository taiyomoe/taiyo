import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"

const styles = stylex.create({
  section: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: font.weightBold,
    letterSpacing: "-0.01em",
  },
  description: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
})

export function ShopSection({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section sx={styles.section}>
      <div sx={styles.header}>
        <h2 sx={styles.title}>{title}</h2>
        {description === undefined ? null : <p sx={styles.description}>{description}</p>}
      </div>
      {action}
      {children}
    </section>
  )
}
