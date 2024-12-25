import { Navbar } from "~/components/navbar/navbar"
import type { LayoutProps } from "~/lib/types"
import { SnowflakesProvider } from "./_components/snowflakes-provider"

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-full flex-col">
      <SnowflakesProvider />
      <Navbar />
      {children}
    </div>
  )
}
