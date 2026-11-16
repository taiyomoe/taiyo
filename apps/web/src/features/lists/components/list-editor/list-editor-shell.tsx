import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { sceneFont } from "@taiyomoe/ui/styles/scene.stylex"
import { breakpoints, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { Session } from "@/lib/session"
import { pageFrame } from "@/components/layout/page-frame"
import { AppShell } from "@/components/shell/app-shell"

const styles = stylex.create({
  page: {
    gap: "1.5rem",
    display: "flex",
    flexDirection: "column",
    paddingBottom: "2.5rem",
    paddingTop: "2rem",
  },
  heading: {
    margin: 0,
    fontFamily: sceneFont.display,
    fontSize: { default: "1.75rem", [breakpoints.md]: "2.25rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
  },
})

export function ListEditorShell({
  title,
  user,
  children,
}: {
  title: string
  user: Session["user"]
  children: ReactNode
}) {
  return (
    <AppShell user={user}>
      <div sx={[pageFrame.frame, styles.page]}>
        <h1 sx={styles.heading}>{title}</h1>
        {children}
      </div>
    </AppShell>
  )
}
