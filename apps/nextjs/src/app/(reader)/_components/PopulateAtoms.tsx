"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSetAtom } from "jotai";

import type { MediaChapterLimited } from "@taiyo/db/types";

import {
  mediaChapterAtom,
  mediaChapterNavigationAtom,
} from "~/atoms/mediaChapter.atoms";
import { MediaChapterUtils } from "~/utils/MediaChapterUtils";

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

  return (
    <div className="flex items-center gap-4">
      {/* <p>Set loading</p>
      <ButtonGroup>
        <Button onPress={() => setMediaChapter(null)}>True</Button>
        <Button onPress={() => setMediaChapter(mediaChapter)}>False</Button>
      </ButtonGroup> */}
    </div>
  );
};
