import { useCallback, useState } from "react";
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

  const hasPreviousPage = !!navigation?.previousPage;
  const hasNextPage = !!navigation?.nextPage;

  const goTo = useCallback(
    (newPageNumber: number) => {
      if (!chapter) return;

      const newNavigation = MediaChapterUtils.getNavigation(
        chapter,
        newPageNumber,
      )!;

      window.history.pushState({}, "", `${rawPathname}/${newPageNumber}`);
      setPageNumber(newPageNumber);
      setNavigation(newNavigation);
      // setImages((prev) =>
      //   MediaChapterImageUtils.mergeImages(chapter, newNavigation, prev),
      // );
    },
    [chapter, rawPathname, setNavigation],
  );

  const goBack = useCallback(() => {
    if (!navigation?.previousPage || !pageNumber) {
      return;
    }

    goTo(navigation.previousPage);
  }, [goTo, navigation, pageNumber]);

  const goForward = useCallback(() => {
    if (!navigation?.nextPage || !pageNumber) {
      return;
    }

    goTo(navigation.nextPage);
  }, [goTo, navigation, pageNumber]);

  if (
    pageNumber &&
    chapter &&
    (pageNumber < 0 || pageNumber > chapter.pages.length)
  ) {
    goTo(1);
  }

  return {
    chapter,
    navigation,
    currentPage: navigation?.currentPage ?? null,
    hasPreviousPage,
    hasNextPage,
    goTo,
    goBack,
    goForward,
  };
};
