"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAtomValue } from "jotai";

import type { MediaChapterLimited } from "@taiyo/db/types";

import { mediaChapterNavigationAtom } from "~/atoms/mediaChapter.atoms";
import { MediaChapterUtils } from "~/utils/MediaChapterUtils";

type Props = {
  mediaChapter: MediaChapterLimited;
};

export const DisplayMediaChapterPage = ({ mediaChapter }: Props) => {
  const chapterNavigation = useAtomValue(mediaChapterNavigationAtom);
  const pathname = usePathname();
  const { rawPathname } = MediaChapterUtils.parseUrl(pathname);
  const [currentPageNumber, setCurrentPageNumber] = useState(
    chapterNavigation?.currentPage,
  );

  const currentPageUrl = MediaChapterUtils.getCurrentPageUrl(
    mediaChapter,
    chapterNavigation,
  );

  const handleForwardClick = () => {
    if (chapterNavigation?.nextPage) {
      setCurrentPageNumber(chapterNavigation.nextPage);
    }
  };

  useEffect(() => {
    if (!currentPageNumber) {
      return;
    }

    window.history.pushState({}, "", `${rawPathname}/${currentPageNumber}`);
  }, [currentPageNumber, rawPathname]);

  return (
    <div className="relative flex h-[calc(100%-61px)] bg-pink-800">
      <div className="z-10 h-full w-1/2 bg-blue-800 bg-opacity-50" />
      {currentPageUrl && (
        <Image
          src={currentPageUrl}
          alt="image"
          style={{
            objectFit: "contain",
          }}
          fill
        />
      )}
      <div
        className="z-10 h-full w-1/2 bg-green-800 bg-opacity-50 hover:cursor-pointer focus-visible:outline-none"
        onClick={handleForwardClick}
        onKeyDown={handleForwardClick}
        role="button"
        tabIndex={0}
      />
    </div>
  );
};
