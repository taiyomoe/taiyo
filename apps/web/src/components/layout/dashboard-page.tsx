import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { sceneFont } from "@/components/scene/scene.stylex"

const styles = stylex.create({
  page: {
    gap: "2rem",
    paddingInline: { default: "1.25rem", [breakpoints.md]: "2rem" },
    display: "flex",
    flexDirection: "column",
    maxWidth: "68rem",
    paddingBottom: "3rem",
    paddingTop: "2rem",
    width: "100%",
  },
  header: {
    gap: "1.25rem",
    alignItems: "flex-end",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  intro: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    maxWidth: "44rem",
    minWidth: 0,
  },
  eyebrow: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
  title: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: { default: "1.75rem", [breakpoints.md]: "2.25rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
    overflowWrap: "anywhere",
  },
  subtitle: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "1rem",
    lineHeight: 1.5,
  },
  actions: {
    gap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
  },
  section: {
    gap: "0.875rem",
    display: "flex",
    flexDirection: "column",
  },
  sectionHeader: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 600,
  },
  list: {
    margin: 0,
    padding: 0,
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    listStyle: "none",
    overflow: "hidden",
    backgroundColor: colors.card,
  },
  row: {
    gap: "1rem",
    paddingBlock: "1rem",
    paddingInline: "1.25rem",
    alignItems: "center",
    display: "flex",
    flexWrap: { default: "wrap", [breakpoints.sm]: "nowrap" },
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: { default: 1, ":first-child": 0 },
    minHeight: "4.5rem",
  },
})

export function DashboardPage({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div sx={styles.page}>
      <div sx={styles.header}>
        <div sx={styles.intro}>
          {eyebrow === undefined ? null : <div sx={styles.eyebrow}>{eyebrow}</div>}
          <h1 sx={styles.title}>{title}</h1>
          {subtitle === undefined ? null : <p sx={styles.subtitle}>{subtitle}</p>}
        </div>
        {actions === undefined ? null : <div sx={styles.actions}>{actions}</div>}
      </div>
      {children}
    </div>
  )
}

export function DashboardSection({
  title,
  action,
  children,
}: {
  title: ReactNode
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section sx={styles.section}>
      <div sx={styles.sectionHeader}>
        <h2 sx={styles.sectionTitle}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function ListCard({ children }: { children: ReactNode }) {
  return <ul sx={styles.list}>{children}</ul>
}

export function ListRow({ children }: { children: ReactNode }) {
  return <li sx={styles.row}>{children}</li>
}
