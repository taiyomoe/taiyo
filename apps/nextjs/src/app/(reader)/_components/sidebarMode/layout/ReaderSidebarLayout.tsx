"use client";

import { Divider } from "@nextui-org/divider";
import { useAtomValue } from "jotai";
import { tv } from "tailwind-variants";

import {
  readerSidebarSideAtom,
  readerSidebarStateAtom,
} from "~/atoms/readerSettings.atoms";
import type { ReaderSettings } from "~/types/readerSettings.types";
import { ReaderSidebarSettingsSection } from "../sections/ReaderSidebarSettingsSection";
import { ReaderSidebarUploadersSection } from "../sections/ReaderSidebarUploadersSection";
import { ReaderSettingsMediaChapterDropdown } from "../ui/ReaderSettingsMediaChapterDropdown";
import { ReaderSettingsMediaChapterPageDropdown } from "../ui/ReaderSettingsMediaChapterPageDropdown";
import { ReaderSettingsMediaChapterReportModal } from "../ui/ReaderSettingsMediaChapterReportModal";
import { ReaderSidebarTitle } from "../ui/ReaderSidebarTitle";

type Props = {
  side: ReaderSettings["sidebarSide"];
};

const readerSidebarLayout = tv({
  slots: {
    container:
      "duration-250 hidden min-h-full w-[300px] bg-content1 px-4 transition-all md:block",
    contentWrapper: "fixed flex w-[268px] flex-col gap-2",
  },
  variants: {
    side: {
      left: {
        container: "border-r-divider border-r ml-[-300px] aria-expanded:ml-0",
      },
      right: {
        container: "border-l-divider border-l mr-[-300px] aria-expanded:mr-0",
      },
    },
  },
});

export const ReaderSidebarLayout = ({ side }: Props) => {
  const readerSidebarState = useAtomValue(readerSidebarStateAtom);
  const readerSidebarSide = useAtomValue(readerSidebarSideAtom);

  const { container, contentWrapper } = readerSidebarLayout({
    side: readerSidebarSide,
  });

  if (readerSidebarSide !== side) return null;

  return (
    <div className={container()} aria-expanded={readerSidebarState === "show"}>
      <div className={contentWrapper()}>
        <div className="flex h-[60px] items-center">
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
