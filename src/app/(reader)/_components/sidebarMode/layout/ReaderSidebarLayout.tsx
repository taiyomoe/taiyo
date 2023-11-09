"use client";

import { Divider } from "@nextui-org/divider";
import { useAtomValue } from "jotai";
import { tv } from "tailwind-variants";

import {
  readerSidebarSideAtom,
  readerSidebarStateAtom,
} from "~/atoms/readerSettings.atoms";
import { useDevice } from "~/hooks/useDevice";

import { ReaderSidebarSettingsSection } from "../sections/ReaderSidebarSettingsSection";
import { ReaderSidebarUploadersSection } from "../sections/ReaderSidebarUploadersSection";
import { ReaderSettingsMediaChapterDropdown } from "../ui/ReaderSettingsMediaChapterDropdown";
import { ReaderSettingsMediaChapterPageDropdown } from "../ui/ReaderSettingsMediaChapterPageDropdown";
import { ReaderSettingsMediaChapterReportModal } from "../ui/ReaderSettingsMediaChapterReportModal";
import { ReaderSidebarTitle } from "../ui/ReaderSidebarTitle";

const readerSidebarLayout = tv({
  slots: {
    container: "transition-all z-30",
    contentWrapper:
      "bg-content1 w-[300px] max-w-[300px] right-[unset] width-[unset] flex flex-col gap-2 p-4 pt-0 overflow-x-hidden overflow-y-auto top-0 max-h-screen h-full",
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
          "border-r-divider border-r ml-[-300px] aria-expanded:ml-0 grid-in-leftSidebar",
      },
      right: {
        container:
          "border-l-divider border-l mr-[-300px] aria-expanded:mr-0 grid-in-rightSidebar",
      },
    },
  },
});

export const ReaderSidebarLayout = () => {
  const { isMobile } = useDevice();
  const readerSidebarState = useAtomValue(readerSidebarStateAtom);
  const readerSidebarSide = useAtomValue(readerSidebarSideAtom);

  const { container, contentWrapper } = readerSidebarLayout({
    isMobile,
    side: readerSidebarSide,
  });

  return (
    <div className={container()} aria-expanded={readerSidebarState === "show"}>
      <div className={contentWrapper()}>
        <div className="flex min-h-[var(--navbar-height)] items-center">
          <ReaderSidebarTitle />
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
