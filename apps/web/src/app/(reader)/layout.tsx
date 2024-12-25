import { Navbar } from "~/components/navbar/navbar"
import type { LayoutProps } from "~/lib/types"
import { ReaderSidebarLayout } from "./_components/readerSidebar/layout/ReaderSidebarLayout"
import { ReaderSidebarOpenOverlay } from "./chapter/[chapterId]/_components/ReaderSidebarOpenOverlay"

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-dvh grow flex-col">
      <Navbar />
      <ReaderSidebarOpenOverlay />
      <div className="grid-areas-mediaChapter grid h-full w-full grow grid-cols-mediaChapter overflow-x-clip">
        {children}
        <ReaderSidebarLayout />
      </div>
    </div>
  )
}
