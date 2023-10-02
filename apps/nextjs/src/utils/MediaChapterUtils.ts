import type {
  MediaChapter,
  MediaChapterGroups,
  MediaChapterPage,
  MediaChapters,
} from "@taiyo/db";

import { CDN_DOMAIN } from "./constants";

const getTitle = (mediaChapter: MediaChapter) => {
  return mediaChapter.title ?? "Cap. " + mediaChapter.number;
};

const getUrl = (mediaChapter: MediaChapter) => {
  return `/media/${mediaChapter.mediaId}/chapter/${mediaChapter.id}`;
};

const getPageUrl = (mediaChapter: MediaChapter, page: MediaChapterPage) => {
  return `${CDN_DOMAIN}/${mediaChapter.mediaId}/${mediaChapter.id}/${page.id}.jpg`;
};

const computeVolumes = (mediaChapters: MediaChapters) => {
  const volumes: Record<string, MediaChapters> = {};

  for (const mediaChapter of mediaChapters) {
    const volume = mediaChapter.volume ?? "null";

    if (!volumes[volume]) {
      volumes[volume] = [];
    }

    volumes[volume]?.push(mediaChapter);
  }

  return Object.entries(volumes).map(([volume, mediaChapters]) => {
    const groups: MediaChapterGroups = [];
    const groupsObject: Record<string, MediaChapters> = {};

    for (const mediaChapter of mediaChapters) {
      if (!groupsObject[mediaChapter.number]) {
        groupsObject[mediaChapter.number] = [];
      }

      groupsObject[mediaChapter.number]?.push(mediaChapter);
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
  computeVolumes,
};
