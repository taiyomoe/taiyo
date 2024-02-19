import type { LayoutProps } from "@taiyomoe/types"
import { NavbarAuth } from "~/components/navbar/NavbarAuth"

import { ReaderSidebarLayout } from "./_components/readerSidebar/layout/ReaderSidebarLayout"
import { ReaderSidebarOpenOverlay } from "./chapter/[chapterId]/_components/ReaderSidebarOpenOverlay"

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-dvh grow flex-col">
      <NavbarAuth />
      <ReaderSidebarOpenOverlay />
      <div className="grid h-full w-full grow grid-cols-mediaChapter overflow-x-clip grid-areas-mediaChapter">
        {children}
        <ReaderSidebarLayout />
      </div>
    </div>
  )
}
