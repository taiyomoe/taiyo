import { notFound } from "next/navigation"
import { Navbar } from "~/components/navbar-new/navbar"
import { SidebarInset } from "~/components/sidebar/sidebar"
import { SidebarProvider } from "~/components/sidebar/sidebar-provider"
import type { LayoutProps } from "~/lib/types"
import { getSession } from "~/utils/get-session"
import { DashboardSidebar } from "./_components/dashboard-sidebar"

export default async function Layout({ children }: LayoutProps) {
  const session = await getSession()

  if (!session || session.user.role !== "ADMIN") {
    notFound()
  }

  return (
    <SidebarProvider className="flex w-full">
      <DashboardSidebar />
      <SidebarInset className="w-px">
        <Navbar mode="sticky" showCollapse />
        <main className="w-full max-w-screen-3xl place-self-center p-bodyPadding">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
