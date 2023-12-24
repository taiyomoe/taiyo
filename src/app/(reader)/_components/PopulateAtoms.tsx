"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import type { MediaChapterLimited } from "~/lib/types";
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils";
import { useReaderStore } from "~/stores";

type Props = {
  mediaChapter: MediaChapterLimited;
};

export const PopulateAtoms = ({ mediaChapter }: Props) => {
  const pathname = usePathname();
  const { currentPageNumber } = MediaChapterUtils.parseUrl(pathname);
  const loaded = useRef(false);

  const { load } = useReaderStore();

  useEffect(() => {
    if (!loaded.current) {
      load(mediaChapter, currentPageNumber);
      loaded.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
