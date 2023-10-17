import { DateTime } from "luxon";

import { CDN_DOMAIN } from "~/lib/constants";
import type {
  MediaChapterGroups,
  MediaChapterLimited,
  MediaChapterLimitedBase,
  MediaChapterNavigation,
  MediaChapterPage,
  MediaLimitedChapter,
} from "~/lib/types";

const getTitle = (mediaChapter: MediaLimitedChapter) => {
  return mediaChapter.title ?? "Cap. " + mediaChapter.number;
};

const getUrl = (
  mediaChapter: MediaLimitedChapter | MediaChapterLimitedBase,
) => {
  return `/chapter/${mediaChapter.id}/1`;
};

const getNavigation = (
  mediaChapter: MediaChapterLimited,
  currentPage: number,
): MediaChapterNavigation => ({
  previousPage: currentPage === 1 ? null : currentPage - 1,
  currentPage,
  nextPage: currentPage === mediaChapter.pages.length ? null : currentPage + 1,
});

const getPageUrl = (
  mediaChapter: MediaChapterLimited,
  page: MediaChapterPage,
) => {
  return `${CDN_DOMAIN}/${mediaChapter.media.id}/${mediaChapter.id}/${page.id}.jpg`;
};

const getCurrentPage = (
  media: MediaChapterLimited,
  navigation: MediaChapterNavigation | null,
) => {
  if (!navigation) return;

  return media.pages.at(navigation.currentPage - 1);
};

const getCurrentPageUrl = (
  mediaChapter: MediaChapterLimited | null,
  navigation: MediaChapterNavigation | null,
) => {
  if (!mediaChapter) return;

  const currentPage = getCurrentPage(mediaChapter, navigation);

  if (!currentPage) return;

  return getPageUrl(mediaChapter, currentPage);
};

const computeUploadedTime = (mediaChapter: MediaLimitedChapter) => {
  const uploadedAt = DateTime.fromJSDate(mediaChapter.createdAt);

  return uploadedAt.toRelative({ locale: "pt", style: "short" });
};

const computeVolumes = (mediaChapters: MediaLimitedChapter[]) => {
  const volumes: Record<string, MediaLimitedChapter[]> = {};

  for (const mediaChapter of mediaChapters) {
    const volume = mediaChapter.volume ?? "null";

    if (!volumes[volume]) {
      volumes[volume] = [];
    }

    volumes[volume]?.push(mediaChapter);
  }

  return Object.entries(volumes).map(([volume, mediaChptrs]) => {
    const groups: MediaChapterGroups = [];
    const groupsObject: Record<string, MediaLimitedChapter[]> = {};

    for (const mediaChptr of mediaChptrs) {
      if (!groupsObject[mediaChptr.number]) {
        groupsObject[mediaChptr.number] = [];
      }

      groupsObject[mediaChptr.number]?.push(mediaChptr);
    }

    for (const [_, chptrs] of Object.entries(groupsObject)) {
      groups.push({
        number: chptrs[0]!.number,
        chapters: chptrs,
      });
    }

    return {
      volume,
      groups,
    };
  });
};

const parseUrl = (pathname: string) => {
  const splitted = pathname.split("/");
  const currentPage = splitted[3];

  if (
    !currentPage ||
    splitted.length !== 4 || // if url has more parts than expected
    Number.isNaN(Number(currentPage)) || // if it's NaN
    parseInt(currentPage) !== parseFloat(currentPage) // if it's a float
  ) {
    return {
      rawPathname: pathname,
      currentPageNumber: null,
    };
  }

  return {
    rawPathname: splitted.slice(0, 3).join("/"),
    currentPageNumber: parseInt(currentPage),
  };
};

export const MediaChapterUtils = {
  getTitle,
  getUrl,
  getNavigation,
  getPageUrl,
  getCurrentPage,
  getCurrentPageUrl,
  computeUploadedTime,
  computeVolumes,
  parseUrl,
};
