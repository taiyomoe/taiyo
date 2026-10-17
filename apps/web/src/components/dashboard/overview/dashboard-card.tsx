import type { Sx } from "@taiyomoe/ui/styles/sx"
import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Sliders } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Card } from "@taiyomoe/ui/components/ui/card"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useId } from "react"
import { sceneFont } from "@/components/scene/scene.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  card: {
    padding: "1.5rem",
    gap: "1.25rem",
    minWidth: 0,
  },
  header: {
    gap: "1rem",
    alignItems: "flex-start",
    display: "flex",
  },
  heading: {
    flex: "1",
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  title: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: "1.375rem",
    fontWeight: 700,
    letterSpacing: "-0.01em",
    lineHeight: 1.2,
  },
  subtitle: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
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
  settings: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  skeleton: {
    borderRadius: radius.lg,
    flex: "1",
    minHeight: "12rem",
  },
  note: {
    margin: 0,
    paddingBlock: "2rem",
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    textAlign: "center",
  },
})

type DashboardCardProps = {
  title: string
  subtitle: string
  figure?: ReactNode
  settings?: boolean
  children: ReactNode
  sx?: Sx
}

export function DashboardCard({
  title,
  subtitle,
  figure,
  settings = true,
  children,
  sx,
}: DashboardCardProps) {
  const titleId = useId()

  return (
    <Card aria-labelledby={titleId} render={<section />} sx={[styles.card, sx]}>
      <header sx={styles.header}>
        <div sx={styles.heading}>
          <h2 id={titleId} sx={styles.title}>
            {title}
          </h2>
          <p sx={styles.subtitle}>{subtitle}</p>
        </div>
        {figure}
        {settings ? (
          <Button
            aria-label={m.dashboard_chart_settings({ title })}
            size="icon-lg"
            sx={styles.settings}
            variant="outline"
          >
            <Sliders />
          </Button>
        ) : null}
      </header>
      {children}
    </Card>
  )
}

export function CardFigure({ value, children }: { value: string; children?: ReactNode }) {
  return (
    <div sx={styles.figure}>
      <span sx={styles.figureValue}>{value}</span>
      {children}
    </div>
  )
}

export function CardSkeleton({ sx }: { sx?: Sx }) {
  return <Skeleton sx={[styles.skeleton, sx]} />
}

export function CardNote({ children }: { children: ReactNode }) {
  return <p sx={styles.note}>{children}</p>
}
