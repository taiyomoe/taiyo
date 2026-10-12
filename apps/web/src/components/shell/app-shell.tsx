import * as stylex from "@stylexjs/stylex"
import { SidebarInset, SidebarProvider } from "@taiyomoe/ui/components/ui/sidebar"
import { useRouteContext } from "@tanstack/react-router"
import type { ReactNode } from "react"

import { AppNavbar } from "@/components/shell/app-navbar"
import { AppSidebar } from "@/components/shell/app-sidebar"
import type { Session } from "@/lib/queries/session"

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

export function AppShell({ user, children }: { user: Session["user"]; children: ReactNode }) {
  const { sidebarPrefs } = useRouteContext({ from: "__root__" })

  return (
    <SidebarProvider
      data-app-shell=""
      defaultOpen={sidebarPrefs.defaultOpen}
      defaultWidth={sidebarPrefs.defaultWidth ?? 248}
      sx={styles.provider}
    >
      <AppNavbar user={user} />
      <div sx={styles.body}>
        <AppSidebar />
        <SidebarInset sx={styles.inset}>{children}</SidebarInset>
      </div>
    </SidebarProvider>
  )
}
