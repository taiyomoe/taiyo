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
      "-mr-readerSidebar top-0 right-0 z-40 border-l border-l-divider transition-all aria-expanded:mr-0",
    contentWrapper:
      "width-[unset] sticky top-0 right-[unset] flex h-dvh max-h-dvh w-[calc(var(--library-sidebar-width)-1px)] max-w-[calc(var(--library-sidebar-width)-1px)] flex-col gap-4 overflow-y-auto overflow-x-hidden bg-content1 p-4",
  },
  variants: {
    isMobile: {
      true: {
        container: "fixed right-0 shadow-xl",
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
