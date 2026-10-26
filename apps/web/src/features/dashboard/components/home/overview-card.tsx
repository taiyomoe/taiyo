import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Card } from "@taiyomoe/ui/components/ui/card"
import { sceneFont } from "@/components/scene/scene.stylex"
import { homeStyles } from "@/features/dashboard/components/home/home-styles"

const styles = stylex.create({
  card: {
    padding: "1.5rem",
    gap: "1.25rem",
    minWidth: 0,
  },
  header: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
  },
  title: {
    margin: 0,
    flexGrow: 1,
    fontFamily: sceneFont.display,
    fontSize: "1.25rem",
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
  actions: {
    gap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
    marginTop: "auto",
  },
})

type OverviewCardProps = {
  icon: ReactNode
  title: string
  children: ReactNode
  actions: ReactNode
}

export function OverviewCard({ icon, title, children, actions }: OverviewCardProps) {
  return (
    <Card sx={styles.card}>
      <div sx={styles.header}>
        <span sx={homeStyles.icon}>{icon}</span>
        <h3 sx={styles.title}>{title}</h3>
      </div>
      {children}
      <div sx={styles.actions}>{actions}</div>
    </Card>
  )
}
