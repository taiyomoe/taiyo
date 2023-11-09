import { usePathname } from "next/navigation";
import { useAtomValue } from "jotai";

import {
  readerNavbarModeAtom,
  readerSidebarSideAtom,
  readerSidebarStateAtom,
} from "~/atoms/readerSettings.atoms";

import { useDevice } from "./useDevice";

export const useChapterNavbar = () => {
  const readerSidebarSide = useAtomValue(readerSidebarSideAtom);
  const readerSidebarState = useAtomValue(readerSidebarStateAtom);
  const readerNavbarMode = useAtomValue(readerNavbarModeAtom);
  const pathname = usePathname();
  const { isMobile } = useDevice();

  return {
    mode: readerNavbarMode,
    sidebarSide: readerSidebarSide,
    expand:
      isMobile ||
      readerSidebarState === "hide" ||
      !pathname.includes("/chapter/"),
  };
};
