import { cookies } from "next/headers"
import { siteConfig } from "~/site-config"
import type { LayoutProps } from "~/utils/types"
import { Navbar } from "./_components/navbar/navbar"
import { Sidebar } from "./_components/sidebar/sidebar"
import { SidebarProvider } from "./_components/sidebar/sidebar-context"

export default async function Layout({ children }: LayoutProps) {
  const cookieStore = await cookies()
  const defaultOpen =
    cookieStore.get(siteConfig.sidebar.cookie.name)?.value !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar />
      <div className="w-full transition-[max-width] duration-300 md:max-w-[calc(100%-var(--sidebar-width))]">
        <Navbar />
        {children}
      </div>
    </SidebarProvider>
  )
}
