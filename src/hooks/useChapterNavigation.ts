import { useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { MediaUtils } from "~/lib/utils/media.utils";
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils";
import { useReaderStore } from "~/stores";

export const useChapterNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { rawPathname, currentPageNumber: initialPageNumber } =
    MediaChapterUtils.parseUrl(pathname);

  const { chapter, navigation, updateNavigation } = useReaderStore();
  const [pageNumber, setPageNumber] = useState(initialPageNumber);

  const goTo = useCallback(
    (newPageNumber: number) => {
      if (!chapter) return;

      window.history.pushState({}, "", `${rawPathname}/${newPageNumber}`);
      setPageNumber(newPageNumber);
      updateNavigation(newPageNumber);
      window.scrollTo(0, 0);
    },
    [chapter, rawPathname, updateNavigation],
  );

  const goBack = useCallback(() => {
    if (!chapter || !navigation || !pageNumber) {
      return;
    }

    /**
     * Go to the previous page, if there is one.
     */
    if (navigation.previousPage) {
      return goTo(navigation.previousPage);
    }

    /**
     * If there is no previous page but here is a previous chapter,
     * then we should go to the previous chapter.
     */
    if (chapter.previousChapter) {
      return router.push(MediaChapterUtils.getUrl(chapter.previousChapter));
    }

    /**
     * If there is no previous page and no previous chapter,
     * then we should return to the media page.
     */
    return router.push(MediaUtils.getUrl(chapter.media));
  }, [chapter, goTo, navigation, pageNumber, router]);

  const goForward = useCallback(() => {
    if (!chapter || !navigation || !pageNumber) {
      return;
    }

    /**
     * Go to the next page, if there is one.
     */
    if (navigation.nextPage) {
      return goTo(navigation.nextPage);
    }

    /**
     * If there is no next page but here is a next chapter,
     * then we should go to the next chapter.
     */
    if (chapter.nextChapter) {
      return router.push(MediaChapterUtils.getUrl(chapter.nextChapter));
    }

    /**
     * If there is no next page and no next chapter,
     * then we should return to the media page.
     */
    return router.push(MediaUtils.getUrl(chapter.media));
  }, [chapter, goTo, navigation, pageNumber, router]);

  /**
   * If the page number in the URL is invalid (either negative or too high),
   * go to the first page.
   */
  if (
    pageNumber &&
    chapter &&
    (pageNumber < 0 || pageNumber > chapter.pages.length)
  ) {
    goTo(1);
  }

  return {
    goTo,
    goBack,
    goForward,
  };
};
