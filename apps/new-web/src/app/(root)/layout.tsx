import type { LayoutProps } from "~/utils/types"
import { Sidebar } from "./_components/sidebar"

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-dvh [--sidebar-width:256px]">
      <Sidebar />
      {children}
    </div>
  )
}
