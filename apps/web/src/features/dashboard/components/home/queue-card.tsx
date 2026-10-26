import type { LinkProps } from "@tanstack/react-router"
import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Card } from "@taiyomoe/ui/components/ui/card"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { homeStyles } from "@/features/dashboard/components/home/home-styles"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  queue: {
    padding: "1.25rem",
    gap: "1rem",
    textDecoration: "none",
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  queueText: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  queueLabel: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
})

type QueueCardProps = {
  count: number
  label: string
  icon: ReactNode
  to: NonNullable<LinkProps["to"]>
}

export function QueueCard({ count, label, icon, to }: QueueCardProps) {
  return (
    <Card render={<Link to={to} />} sx={styles.queue}>
      <span sx={homeStyles.icon}>{icon}</span>
      <span sx={styles.queueText}>
        <span sx={homeStyles.statValue}>{count}</span>
        <span sx={styles.queueLabel}>{label}</span>
      </span>
      {count > 0 ? <Badge variant="warning">{m.home_overview_waiting()}</Badge> : null}
    </Card>
  )
}
