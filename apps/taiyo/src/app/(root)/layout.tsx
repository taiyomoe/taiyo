import type { LayoutProps } from "@taiyomoe/types"
import { NavbarAuth } from "~/components/navbar/NavbarAuth"

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-full flex-col">
      <NavbarAuth />
      {children}
    </div>
  )
}
