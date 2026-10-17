import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { SidebarInset, SidebarProvider } from "@taiyomoe/ui/components/ui/sidebar"
import { useRouteContext } from "@tanstack/react-router"
import type { Session } from "@/lib/queries/session"
import { AppNavbar } from "@/components/shell/app-navbar"
import { type AppSidebarSection, AppSidebar } from "@/components/shell/app-sidebar"

const styles = stylex.create({
  provider: {
    "--navbar-height": "4.5rem",
    flexDirection: "column",
  },
  body: {
    flex: "1",
    display: "flex",
    minHeight: 0,
    paddingTop: "var(--navbar-height)",
  },
  inset: {
    minWidth: 0,
  },
})

type AppShellProps = {
  user: Session["user"] | null
  overlayNavbar?: boolean
  sections?: readonly AppSidebarSection[]
  children: ReactNode
}

export function AppShell({ user, overlayNavbar = false, sections, children }: AppShellProps) {
  const { sidebarPrefs } = useRouteContext({ from: "__root__" })

  return (
    <SidebarProvider
      data-app-shell=""
      defaultOpen={sidebarPrefs.defaultOpen}
      defaultWidth={sidebarPrefs.defaultWidth ?? 248}
      sx={styles.provider}
    >
      <AppNavbar overlay={overlayNavbar} user={user} />
      <div sx={styles.body}>
        <AppSidebar sections={sections} />
        <SidebarInset sx={styles.inset}>{children}</SidebarInset>
      </div>
    </SidebarProvider>
  )
}
