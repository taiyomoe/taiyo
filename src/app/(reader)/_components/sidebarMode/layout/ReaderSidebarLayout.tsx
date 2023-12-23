"use client";

import { Divider } from "@nextui-org/divider";
import { tv } from "tailwind-variants";

import { useDevice } from "~/hooks/useDevice";
import { useReaderStore } from "~/stores";

import { ReaderSidebarSettingsSection } from "../sections/ReaderSidebarSettingsSection";
import { ReaderSidebarUploadersSection } from "../sections/ReaderSidebarUploadersSection";
import { ReaderSettingsMediaChapterDropdown } from "../ui/ReaderSettingsMediaChapterDropdown";
import { ReaderSettingsMediaChapterPageDropdown } from "../ui/ReaderSettingsMediaChapterPageDropdown";
import { ReaderSettingsMediaChapterReportModal } from "../ui/ReaderSettingsMediaChapterReportModal";
import { ReaderSidebarHeader } from "../ui/ReaderSidebarHeader";

const readerSidebarLayout = tv({
  slots: {
    container: "transition-all z-30 h-full",
    contentWrapper:
      "bg-content1 w-[calc(var(--reader-sidebar-width)-1px)] max-w-[calc(var(--reader-sidebar-width)-1px)] right-[unset] width-[unset] flex flex-col gap-2 p-4 pt-0 overflow-x-hidden overflow-y-auto top-0 max-h-screen h-full sticky",
  },
  variants: {
    isMobile: {
      true: {
        container: "fixed shadow-xl right-0",
      },
      false: {
        container: "sticky",
      },
    },
    side: {
      left: {
        container:
          "border-r-divider border-r -ml-readerSidebar aria-expanded:ml-0 grid-in-leftSidebar",
      },
      right: {
        container:
          "border-l-divider border-l -mr-readerSidebar aria-expanded:mr-0 grid-in-rightSidebar",
      },
    },
  },
});

export const ReaderSidebarLayout = () => {
  const { state, side } = useReaderStore((state) => state.settings.sidebar);
  const { isMobile } = useDevice();

  const slots = readerSidebarLayout({ isMobile, side });

  return (
    <div className={slots.container()} aria-expanded={state === "show"}>
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
  );
};
