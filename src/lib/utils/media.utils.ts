import type { Languages, UploadSessionType } from "@prisma/client";

import { env } from "~/lib/env.mjs";
import type { MediaLimited } from "~/lib/types";
import { MediaCoverUtils } from "~/lib/utils/mediaCover.utils";

const getUrl = (media: { id: string }) => `/media/${media.id}`;

const getUploadUrl = (type: UploadSessionType) =>
  `${env.NEXT_PUBLIC_IO_URL}/upload/${type.toLowerCase()}`;

const getBannerOrCoverUrl = (media: MediaLimited) => {
  if (!media.bannerId) return MediaCoverUtils.getUrl(media);

  return `${env.NEXT_PUBLIC_CDN_URL}/medias/${media.id}/banners/${media.bannerId}.jpg`;
};

const getMainTitle = (
  titles: MediaLimited["titles"],
  preferredTitles: Languages | null | undefined,
) => {
  if (!preferredTitles) {
    return titles.find((t) => t.isMainTitle)!.title;
  }

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
  getUploadUrl,
  getBannerOrCoverUrl,
  getMainTitle,
  getUploadEndpoint: () => `${env.NEXT_PUBLIC_IO_URL}/upload/url`,
};
