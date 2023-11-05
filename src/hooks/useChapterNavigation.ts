import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useAtom, useAtomValue } from "jotai";

import {
  mediaChapterAtom,
  mediaChapterNavigationAtom,
} from "~/atoms/mediaChapter.atoms";
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils";

export const useChapterNavigation = () => {
  const pathname = usePathname();
  const { rawPathname, currentPageNumber: initialPageNumber } =
    MediaChapterUtils.parseUrl(pathname);
  const chapter = useAtomValue(mediaChapterAtom);
  const [navigation, setNavigation] = useAtom(mediaChapterNavigationAtom);

  const [pageNumber, setPageNumber] = useState(initialPageNumber);
  const currentPageUrl = useMemo(
    () => MediaChapterUtils.getCurrentPageUrl(chapter, navigation) ?? null,
    [chapter, navigation],
  );

  const hasPreviousPage = !!navigation?.previousPage;
  const hasNextPage = !!navigation?.nextPage;

  const goTo = (newPageNumber: number) => {
    if (!chapter) return;

    window.history.pushState({}, "", `${rawPathname}/${newPageNumber}`);
    setPageNumber(newPageNumber);
    setNavigation(MediaChapterUtils.getNavigation(chapter, newPageNumber)!);
  };

  const goBack = () => {
    if (!navigation?.previousPage || !pageNumber) {
      return;
    }

    goTo(navigation.previousPage);
  };

  const goForward = () => {
    if (!navigation?.nextPage || !pageNumber) {
      return;
    }

    goTo(navigation.nextPage);
  };

  if (
    pageNumber &&
    chapter &&
    (pageNumber < 0 || pageNumber > chapter.pages.length)
  ) {
    goTo(1);
  }

  return {
    chapter,
    currentPageUrl,
    currentPage: navigation?.currentPage ?? null,
    hasPreviousPage,
    hasNextPage,
    goTo,
    goBack,
    goForward,
  };
};
