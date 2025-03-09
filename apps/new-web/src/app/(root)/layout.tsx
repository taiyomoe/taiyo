import type { LayoutProps } from "~/utils/types"
import { Sidebar } from "./_components/sidebar"
import { SidebarProvider } from "./_components/sidebar-context"

export default function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar />
      {children}
    </SidebarProvider>
  )
}
