import * as stylex from "@stylexjs/stylex"
import { Outlet, createFileRoute } from "@tanstack/react-router"
import { SidebarInset, SidebarProvider } from "@taiyomoe/ui/components/ui/sidebar"
import { consts } from "@taiyomoe/ui/styles/tokens.stylex"

import { AppNav } from "@/components/app/app-nav"
import { AppSidebar } from "@/components/app/app-sidebar"

export const Route = createFileRoute("/_app")({
  component: AppLayout,
})

const styles = stylex.create({
  content: {
    marginInline: "auto",
    paddingBlock: { default: "1.5rem 3rem", [consts.sm]: "2rem 4rem" },
    paddingInline: { default: "1rem", [consts.sm]: "2rem" },
    maxWidth: "80rem",
    width: "100%",
  },
})

function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppNav />
        <div sx={styles.content}>
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
