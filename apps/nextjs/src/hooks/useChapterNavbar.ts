import { usePathname } from "next/navigation";
import { useAtomValue } from "jotai";

import {
  readerNavbarModeAtom,
  readerSidebarSideAtom,
  readerSidebarStateAtom,
} from "~/atoms/readerSettings.atoms";

export const useChapterNavbar = () => {
  const readerSidebarSide = useAtomValue(readerSidebarSideAtom);
  const readerSidebarState = useAtomValue(readerSidebarStateAtom);
  const readerNavbarMode = useAtomValue(readerNavbarModeAtom);
  const pathname = usePathname();

  return {
    mode: readerNavbarMode,
    sidebarSide: readerSidebarSide,
    expand: readerSidebarState === "hide" || !pathname.includes("/chapter/"),
  };
};
