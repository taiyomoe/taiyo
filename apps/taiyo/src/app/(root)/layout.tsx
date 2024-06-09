import { Navbar } from "~/components/navbar/Navbar"
import type { LayoutProps } from "~/lib/types"

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-full flex-col">
      <Navbar />
      {children}
    </div>
  )
}
