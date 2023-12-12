"use client";

import { useEffect } from "react";
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

  const { load, unload } = useReaderStore();

  useEffect(() => {
    load(mediaChapter, currentPageNumber);

    return () => {
      unload();
    };
  }, [load, mediaChapter, currentPageNumber, unload]);

  return null;
};
