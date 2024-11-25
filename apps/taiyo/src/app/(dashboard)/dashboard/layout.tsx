import { auth } from "@taiyomoe/auth/server"
import { notFound } from "next/navigation"
import { Navbar } from "~/components/navbar-new/navbar"
import { SidebarInset } from "~/components/sidebar/sidebar"
import { SidebarProvider } from "~/components/sidebar/sidebar-provider"
import type { LayoutProps } from "~/lib/types"
import { DashboardSidebar } from "./_components/dashboard-sidebar"

export default async function Layout({ children }: LayoutProps) {
  const session = await auth()

  if (!session || session.user.role.name !== "ADMIN") {
    notFound()
  }

  return (
    <SidebarProvider className="flex w-full">
      <DashboardSidebar />
      <SidebarInset className="w-full md:max-w-[calc(100%-var(--sidebar-width))]">
        <Navbar mode="sticky" />
        <main className="p-bodyPadding">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
