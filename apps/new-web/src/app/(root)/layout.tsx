import { cookies } from "next/headers"
import { siteConfig } from "~/site-config"
import type { LayoutProps } from "~/utils/types"
import { Sidebar } from "./_components/sidebar"
import { SidebarProvider } from "./_components/sidebar-context"

export default async function Layout({ children }: LayoutProps) {
  const cookieStore = await cookies()
  const defaultOpen =
    cookieStore.get(siteConfig.sidebar.cookie.name)?.value !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar />
      {children}
    </SidebarProvider>
  )
}
