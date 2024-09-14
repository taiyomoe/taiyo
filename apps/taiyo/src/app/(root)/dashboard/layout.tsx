import { auth } from "@taiyomoe/auth"
import { notFound } from "next/navigation"
import { Sidebar } from "~/components/layout/Sidebar"
import type { LayoutProps } from "~/lib/types"
import { DashboardSidebarContent } from "./_components/dashboard-sidebar-content"

export default async function Layout({ children }: LayoutProps) {
  const session = await auth()

  if (!session || session.user.role.name !== "ADMIN") {
    notFound()
  }

  return (
    <div className="flex h-full min-h-[calc(100dvh-var(--navbar-height))] w-full">
      <Sidebar
        title="Dashboard"
        content={<DashboardSidebarContent className="sticky top-navbar" />}
      />
      <div className="w-full overflow-auto p-bodyPadding">{children}</div>
    </div>
  )
}
