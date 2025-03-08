import { SidebarContent } from "./sidebar-content"
import { SidebarFooter } from "./sidebar-footer"
import { SidebarHeader } from "./sidebar-header"

export const Sidebar = () => {
  return (
    <aside className="relative w-(--sidebar-width) border-subtle border-r bg-muted">
      <SidebarHeader />
      <SidebarContent />
      <SidebarFooter />
    </aside>
  )
}
