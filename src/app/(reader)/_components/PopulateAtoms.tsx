"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSetAtom } from "jotai";

import {
  mediaChapterAtom,
  mediaChapterNavigationAtom,
} from "~/atoms/mediaChapter.atoms";
import type { MediaChapterLimited } from "~/lib/types";
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils";

type Props = {
  mediaChapter: MediaChapterLimited;
};

export const PopulateAtoms = ({ mediaChapter }: Props) => {
  const pathname = usePathname();
  const { currentPageNumber } = MediaChapterUtils.parseUrl(pathname);

  const setMediaChapter = useSetAtom(mediaChapterAtom);
  const setMediaChapterNavigation = useSetAtom(mediaChapterNavigationAtom);

  useEffect(() => {
    setMediaChapter(mediaChapter);

    if (currentPageNumber) {
      const mediaChapterNavigation = MediaChapterUtils.getNavigation(
        mediaChapter,
        currentPageNumber,
      );

      setMediaChapterNavigation(mediaChapterNavigation);
    }
  }, [
    currentPageNumber,
    mediaChapter,
    setMediaChapter,
    setMediaChapterNavigation,
  ]);

  return null;
};
