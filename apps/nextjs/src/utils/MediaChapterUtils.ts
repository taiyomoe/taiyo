import { DateTime } from "luxon";

import type {
  MediaChapter,
  MediaChapterGroups,
  MediaChapterPage,
  MediaChapterWithUsers,
} from "@taiyo/db/types";

import { CDN_DOMAIN } from "./constants";

const getTitle = (mediaChapter: MediaChapter) => {
  return mediaChapter.title ?? "Cap. " + mediaChapter.number;
};

const getUrl = (mediaChapter: MediaChapter) => {
  return `/chapter/${mediaChapter.id}`;
};

const getPageUrl = (mediaChapter: MediaChapter, page: MediaChapterPage) => {
  return `${CDN_DOMAIN}/${mediaChapter.mediaId}/${mediaChapter.id}/${page.id}.jpg`;
};

const computeUploadedTime = (mediaChapter: MediaChapter) => {
  const uploadedAt = DateTime.fromJSDate(mediaChapter.createdAt);

  return uploadedAt.toRelative({ locale: "pt" });
};

const computeVolumes = (mediaChapters: MediaChapterWithUsers) => {
  const volumes: Record<string, MediaChapterWithUsers> = {};

  for (const mediaChapter of mediaChapters) {
    const volume = mediaChapter.volume ?? "null";

    if (!volumes[volume]) {
      volumes[volume] = [];
    }

    volumes[volume]?.push(mediaChapter);
  }

  return Object.entries(volumes).map(([volume, mediaChptrs]) => {
    const groups: MediaChapterGroups = [];
    const groupsObject: Record<string, MediaChapterWithUsers> = {};

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
