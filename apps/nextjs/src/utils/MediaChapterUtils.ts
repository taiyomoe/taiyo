import type {
  MediaChapter,
  MediaChapterGroups,
  MediaChapters,
} from "@taiyo/db";

const getTitle = (chapter: MediaChapter) => {
  return chapter.title ?? "Cap. " + chapter.number;
};

const getUrl = (chapter: MediaChapter) => {
  return `/media/${chapter.mediaId}/chapter/${chapter.id}`;
};

const computeVolumes = (chapters: MediaChapters) => {
  const volumes: Record<string, MediaChapters> = {};

  for (const mediaChapter of chapters) {
    const volume = mediaChapter.volume ?? "null";

    if (!volumes[volume]) {
      volumes[volume] = [];
    }

    volumes[volume]?.push(mediaChapter);
  }

  return Object.entries(volumes).map(([volume, chapters]) => {
    const groups: MediaChapterGroups = [];
    const groupsObject: Record<string, MediaChapters> = {};

    for (const mediaChapter of chapters) {
      if (!groupsObject[mediaChapter.number]) {
        groupsObject[mediaChapter.number] = [];
      }

      groupsObject[mediaChapter.number]?.push(mediaChapter);
    }

    for (const [_, chapters] of Object.entries(groupsObject)) {
      groups.push(chapters);
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
  computeVolumes,
};
