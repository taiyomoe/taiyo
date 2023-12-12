import { usePathname } from "next/navigation";

import { useReaderStore } from "~/stores";

import { useDevice } from "./useDevice";

export const useChapterNavbar = () => {
  const { navbar, sidebar } = useReaderStore((state) => state.settings);
  const pathname = usePathname();
  const { isMobile } = useDevice();

  return {
    mode: navbar.mode,
    sidebarSide: sidebar.side,
    expand:
      isMobile || sidebar.state === "hide" || !pathname.includes("/chapter/"),
  };
};
