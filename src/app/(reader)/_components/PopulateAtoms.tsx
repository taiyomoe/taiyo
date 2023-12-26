"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { useDevice } from "~/hooks/useDevice";
import type { MediaChapterLimited } from "~/lib/types";
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils";
import { useReaderSettingsStore, useReaderStore } from "~/stores";

type Props = {
  mediaChapter: MediaChapterLimited;
};

export const PopulateAtoms = ({ mediaChapter }: Props) => {
  const readerSettings = useReaderSettingsStore();
  const { load } = useReaderStore();
  const { isAboveTablet } = useDevice();
  const pathname = usePathname();
  const loaded = useRef(false);

  const { currentPageNumber } = MediaChapterUtils.parseUrl(pathname);

  useEffect(() => {
    if (!loaded.current) {
      load(mediaChapter, currentPageNumber);
      loaded.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAboveTablet) return;

    if (readerSettings.sidebar.openMode === "hover") {
      readerSettings.update("sidebar.openMode", "button");
    }

    if (readerSettings.navbarMode === "hover") {
      readerSettings.update("navbarMode", "sticky");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAboveTablet]);

  return null;
};
