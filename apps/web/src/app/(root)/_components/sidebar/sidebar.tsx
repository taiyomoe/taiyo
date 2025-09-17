"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@taiyomoe/ui/components/sheet"
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
          open={openMobile}
          side="left"
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
      <div className="relative hidden min-w-(--sidebar-width) bg-transparent transition-[min-width] duration-300 md:block" />
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
