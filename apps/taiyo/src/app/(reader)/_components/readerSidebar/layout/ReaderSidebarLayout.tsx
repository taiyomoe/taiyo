"use client"

import { Divider } from "@nextui-org/divider"
import { tv } from "tailwind-variants"
import { useReaderSettingsStore } from "~/stores"
import { ReaderSidebarSettingsSection } from "../sections/ReaderSidebarSettingsSection"
import { ReaderSidebarUploadersSection } from "../sections/ReaderSidebarUploadersSection"
import { ReaderSettingsMediaChapterDropdown } from "../ui/ReaderSettingsMediaChapterDropdown"
import { ReaderSettingsMediaChapterPageDropdown } from "../ui/ReaderSettingsMediaChapterPageDropdown"
import { ReaderSettingsMediaChapterReportModal } from "../ui/ReaderSettingsMediaChapterReportModal"
import { ReaderSidebarHeader } from "../ui/ReaderSidebarHeader"

const readerSidebarLayout = tv({
  slots: {
    container:
      "bg-content1 transition-all z-30 h-full -mt-navbar fixed shadow-xl md:sticky md:shadow-none data-[navbar-mode=hover]:mt-0  data-[page-mode=longstrip]:h-[calc(100%+var(--navbar-height))]",
    contentWrapper:
      "bg-content1 w-[calc(var(--reader-sidebar-width)-1px)] max-w-[calc(var(--reader-sidebar-width)-1px)] right-[unset] width-[unset] flex flex-col gap-2 p-4 pt-0 overflow-x-hidden overflow-y-auto top-0 max-h-dvh sticky scrollbar-thin scrollbar-track-content2 scrollbar-thumb-content3",
  },
  variants: {
    side: {
      left: {
        container:
          "border-r-divider border-r -ml-readerSidebar aria-expanded:ml-0 grid-in-leftSidebar left-0 md:left-[unset]",
      },
      right: {
        container:
          "border-l-divider border-l -mr-readerSidebar aria-expanded:mr-0 grid-in-rightSidebar right-0 md:right-[unset]",
      },
    },
  },
})

export const ReaderSidebarLayout = () => {
  const {
    navbarMode,
    sidebar: { state, side },
    page: { mode: pageMode },
  } = useReaderSettingsStore()

  const slots = readerSidebarLayout({ side })

  return (
    <div
      className={slots.container()}
      data-navbar-mode={navbarMode}
      data-page-mode={pageMode}
      aria-expanded={state === "show"}
    >
      <div className={slots.contentWrapper()}>
        <div className="flex min-h-[var(--navbar-height)] items-center">
          <ReaderSidebarHeader />
        </div>
        <div className="flex flex-col gap-2">
          <ReaderSettingsMediaChapterPageDropdown />
          <ReaderSettingsMediaChapterDropdown />
          <ReaderSettingsMediaChapterReportModal />
        </div>
        <Divider className="my-4" />
        <ReaderSidebarUploadersSection className="flex flex-col gap-2" />
        <Divider className="my-4" />
        <ReaderSidebarSettingsSection />
      </div>
    </div>
  )
}
