"use client";

import { Divider } from "@nextui-org/divider";
import { useAtomValue } from "jotai";
import { tv } from "tailwind-variants";

import {
  readerSidebarSideAtom,
  readerSidebarStateAtom,
} from "~/atoms/readerSettings.atoms";
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
      "bg-content1 min-w-[300px] sticky right-[unset] width-[unset] flex flex-col gap-2 p-4 pt-0 overflow-x-hidden overflow-y-auto top-0 max-h-screen h-full",
  },
  variants: {
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
  const readerSidebarState = useAtomValue(readerSidebarStateAtom);
  const readerSidebarSide = useAtomValue(readerSidebarSideAtom);

  const { container, contentWrapper } = readerSidebarLayout({
    side: readerSidebarSide,
  });

  return (
    <div className={container()} aria-expanded={readerSidebarState === "show"}>
      <div className={contentWrapper()}>
        <div className="flex min-h-[60px] items-center">
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
