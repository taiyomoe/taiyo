"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet"
import { SidebarContent } from "./sidebar-content"
import { useSidebar } from "./sidebar-context"
import { SidebarFooter } from "./sidebar-footer"
import { SidebarHeader } from "./sidebar-header"
import { SidebarRail } from "./sidebar-rail"

export const Sidebar = () => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          className="w-64 p-0 [&>button]:hidden"
          side="left"
          data-state={openMobile ? "open" : "closed"}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="group size-full" data-state="expanded">
            <SidebarHeader />
            <SidebarContent />
            <SidebarFooter />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <>
      <div className="relative hidden w-(--sidebar-width) bg-transparent transition-[width] duration-300 md:block" />
      <aside
        className="group fixed inset-y-0 hidden max-h-dvh w-(--sidebar-width) border-subtle border-r bg-muted transition-[width] duration-300 md:block"
        data-state={state}
      >
        <SidebarHeader />
        <SidebarContent />
        <SidebarFooter />
        <SidebarRail />
      </aside>
    </>
  )
}
