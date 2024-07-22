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
      "-mt-navbar fixed z-30 h-dvh bg-content1 shadow-xl data-[navbar-mode=hover]:mt-0 md:sticky md:shadow-none",
    contentWrapper:
      "width-[unset] scrollbar-thin scrollbar-track-content2 scrollbar-thumb-content3 sticky top-0 right-[unset] flex max-h-dvh w-[calc(var(--reader-sidebar-width)-1px)] max-w-[calc(var(--reader-sidebar-width)-1px)] flex-col gap-2 overflow-y-auto overflow-x-hidden bg-content1 p-4 pt-0",
  },
  variants: {
    side: {
      left: {
        container:
          "-ml-readerSidebar grid-in-leftSidebar left-0 border-r border-r-divider aria-expanded:ml-0 md:left-[unset]",
      },
      right: {
        container:
          "-mr-readerSidebar grid-in-rightSidebar right-0 border-l border-l-divider aria-expanded:mr-0 md:right-[unset]",
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
