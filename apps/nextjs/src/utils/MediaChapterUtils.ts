import { DateTime } from "luxon";

import type {
  MediaChapterGroups,
  MediaChapterLimited,
  MediaChapterPage,
  MediaLimitedChapter,
} from "@taiyo/db/types";

import { CDN_DOMAIN } from "./constants";

const getTitle = (mediaChapter: MediaLimitedChapter) => {
  return mediaChapter.title ?? "Cap. " + mediaChapter.number;
};

const getUrl = (mediaChapter: MediaLimitedChapter) => {
  return `/chapter/${mediaChapter.id}`;
};

const getPageUrl = (
  mediaChapter: MediaChapterLimited,
  page: MediaChapterPage,
) => {
  return `${CDN_DOMAIN}/${mediaChapter.media.id}/${mediaChapter.id}/${page.id}.jpg`;
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
      groups.push(chptrs);
    }

    return {
      volume,
      groups,
    };
  });
};

export const MediaChapterUtils = {
  getTitle,
  getUrl,
  getPageUrl,
  computeUploadedTime,
  computeVolumes,
};
