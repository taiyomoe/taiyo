import { usePathname } from "next/navigation";

import { useReaderStore } from "~/stores";

import { useDevice } from "./useDevice";

export const useChapterNavbar = () => {
  const { navbarMode, sidebar } = useReaderStore((state) => state.settings);
  const pathname = usePathname();
  const { isMobile } = useDevice();

  return {
    mode: navbarMode,
    sidebarSide: sidebar.side,
    expand:
      isMobile || sidebar.state === "hide" || !pathname.includes("/chapter/"),
  };
};
