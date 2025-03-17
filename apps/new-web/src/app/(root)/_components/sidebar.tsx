"use client"

import { SidebarContent } from "./sidebar-content"
import { useSidebar } from "./sidebar-context"
import { SidebarEndContent } from "./sidebar-end-content"
import { SidebarFooter } from "./sidebar-footer"
import { SidebarHeader } from "./sidebar-header"
import { SidebarRail } from "./sidebar-rail"

export const Sidebar = () => {
  const { state } = useSidebar()

  return (
    <>
      <div className="relative w-(--sidebar-width) bg-transparent transition-[width] duration-300" />
      <aside
        className="group fixed inset-y-0 max-h-dvh w-(--sidebar-width) border-subtle border-r bg-muted transition-[width] duration-300"
        data-state={state}
      >
        <SidebarHeader />
        <SidebarContent />
        <SidebarEndContent />
        <SidebarFooter />
        <SidebarRail />
      </aside>
    </>
  )
}
