import type { Languages } from "@prisma/client";

import { CDN_DOMAIN } from "~/lib/constants";
import type {
  LatestMedia,
  MediaChapterLimited,
  MediaLimited,
} from "~/lib/types";

const getUrl = (media: MediaChapterLimited["media"]) => `/media/${media.id}`;

const getCoverUrl = (media: MediaLimited | LatestMedia) =>
  `${CDN_DOMAIN}/${media.id}/covers/${media.coverId}.jpg`;

const getBannerOrCoverUrl = (media: MediaLimited) => {
  if (!media.bannerId) return getCoverUrl(media);

  return `${CDN_DOMAIN}/${media.id}/banners/${media.bannerId}.jpg`;
};

const getMainTitle = (
  titles: MediaLimited["titles"],
  preferredTitles: Languages,
) => {
  const customSort = (
    a: (typeof titles)[number],
    b: (typeof titles)[number],
  ) => {
    // First, sort by language
    if (a.language === preferredTitles && b.language !== preferredTitles) {
      return -1; // preferredTitles comes first
    } else if (
      a.language !== preferredTitles &&
      b.language === preferredTitles
    ) {
      return 1; // preferredTitles comes first
    } else if (a.language === "en" && b.language !== "en") {
      return -1; // "en" comes first
    } else if (a.language !== "en" && b.language === "en") {
      return 1; // "en" comes first
    } else if (a.language === "ja_ro" && b.language !== "ja_ro") {
      return -1; // "ja_ro" comes next
    } else if (a.language !== "ja_ro" && b.language === "ja_ro") {
      return 1; // "ja_ro" comes next

      // If languages are the same, sort by priority
    } else if (b.priority < a.priority) {
      return -1; // a has higher priority
    } else if (b.priority > a.priority) {
      return 1; // b has higher priority
    }

    return 0; // a and b are equal in terms of language and priority
  };

  return titles.sort(customSort).at(0)!.title;
};

export const MediaUtils = {
  getUrl,
  getCoverUrl,
  getBannerOrCoverUrl,
  getMainTitle,
};
