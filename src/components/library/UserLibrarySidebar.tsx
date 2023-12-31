import { tv } from "@nextui-org/react"
import { useRef } from "react"
import { useOnClickOutside } from "usehooks-ts"

import { UserLibrarySidebarTabs } from "~/components/library/UserLibrarySidebarTabs"
import { UserLibrarySidebarTitle } from "~/components/library/UserLibrarySidebarTitle"
import { useDevice } from "~/hooks/useDevice"
import { useLibraryStore } from "~/stores"

const userLibrarySidebar = tv({
  slots: {
    container:
      "transition-all z-40 top-0 right-0 border-l-divider border-l -mr-readerSidebar aria-expanded:mr-0",
    contentWrapper:
      "bg-content1 w-[calc(var(--library-sidebar-width)-1px)] max-w-[calc(var(--library-sidebar-width)-1px)] right-[unset] width-[unset] flex flex-col gap-4 p-4 overflow-x-hidden overflow-y-auto top-0 max-h-dvh h-dvh sticky",
  },
  variants: {
    isMobile: {
      true: {
        container: "fixed shadow-xl right-0",
      },
      false: {
        container: "fixed",
      },
    },
  },
})

export const UserLibrarySidebar = () => {
  const { sidebarState, toggleSidebar } = useLibraryStore()
  const device = useDevice()
  const slots = userLibrarySidebar({ isMobile: device?.isMobile })
  const containerRef = useRef(null)

  useOnClickOutside(
    containerRef,
    () => sidebarState === "show" && toggleSidebar(),
  )

  return (
    <div
      className={slots.container()}
      aria-expanded={sidebarState === "show"}
      ref={containerRef}
    >
      <div className={slots.contentWrapper()}>
        <UserLibrarySidebarTitle />
        <div className="flex flex-col gap-2">
          <UserLibrarySidebarTabs />
        </div>
      </div>
    </div>
  )
}
