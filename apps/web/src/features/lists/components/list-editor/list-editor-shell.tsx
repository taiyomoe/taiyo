import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { breakpoints, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { Session } from "@/lib/session"
import { layout } from "@/components/layout/layout.stylex"
import { sceneFont } from "@/components/scene/scene.stylex"
import { AppShell } from "@/components/shell/app-shell"

const styles = stylex.create({
  page: {
    gap: "1.5rem",
    marginInline: "auto",
    paddingInline: layout.gutter,
    display: "flex",
    flexDirection: "column",
    maxWidth: "72rem",
    paddingBottom: "2.5rem",
    paddingTop: "2rem",
    width: "100%",
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
      <div sx={styles.page}>
        <h1 sx={styles.heading}>{title}</h1>
        {children}
      </div>
    </AppShell>
  )
}
