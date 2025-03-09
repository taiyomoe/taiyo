"use client"

import { SidebarContent } from "./sidebar-content"
import { useSidebar } from "./sidebar-context"
import { SidebarFooter } from "./sidebar-footer"
import { SidebarHeader } from "./sidebar-header"
import { SidebarRail } from "./sidebar-rail"

export const Sidebar = () => {
  const { state } = useSidebar()

  return (
    <aside
      className="group relative w-(--sidebar-width) border-subtle border-r bg-muted transition-[width] duration-300 data-[state=collapsed]:w-(--sidebar-width-icon)"
      data-state={state}
    >
      <SidebarHeader />
      <SidebarContent />
      <SidebarFooter />
      <SidebarRail />
    </aside>
  )
}
