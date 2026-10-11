import * as stylex from "@stylexjs/stylex"
import { SidebarInset, SidebarProvider } from "@taiyomoe/ui/components/ui/sidebar"
import type { CSSProperties, ReactNode } from "react"

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
  },
  inset: {
    minWidth: 0,
  },
})
const layoutVars = { "--sidebar-width": "15.5rem" } as CSSProperties

export function AppShell({ user, children }: { user: Session["user"]; children: ReactNode }) {
  return (
    <SidebarProvider style={layoutVars} sx={styles.provider}>
      <AppNavbar user={user} />
      <div sx={styles.body}>
        <AppSidebar />
        <SidebarInset sx={styles.inset}>{children}</SidebarInset>
      </div>
    </SidebarProvider>
  )
}
