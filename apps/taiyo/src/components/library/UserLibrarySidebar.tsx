import { type RefObject, useRef } from "react"
import { useOnClickOutside } from "usehooks-ts"
import { UserLibrarySidebarTabs } from "~/components/library/UserLibrarySidebarTabs"
import { UserLibrarySidebarTitle } from "~/components/library/UserLibrarySidebarTitle"
import { useLibraryStore } from "~/stores"

export const UserLibrarySidebar = () => {
  const { sidebarState, toggleSidebar } = useLibraryStore()
  const containerRef = useRef<HTMLDivElement>(null)

  useOnClickOutside(
    containerRef as RefObject<HTMLDivElement>,
    () => sidebarState === "show" && toggleSidebar(),
  )

  return (
    <div
      className="-mr-readerSidebar fixed top-0 right-0 z-40 border-l border-l-divider shadow-xl transition-all aria-expanded:mr-0 md:shadow-none"
      aria-expanded={sidebarState === "show"}
      ref={containerRef}
    >
      <div className="width-[unset] sticky top-0 right-[unset] flex h-dvh max-h-dvh w-[calc(var(--library-sidebar-width)-1px)] max-w-[calc(var(--library-sidebar-width)-1px)] flex-col gap-4 overflow-y-auto overflow-x-hidden bg-content1 p-4">
        <UserLibrarySidebarTitle />
        <div className="flex flex-col gap-2">
          <UserLibrarySidebarTabs />
        </div>
      </div>
    </div>
  )
}
