import type {
  MediaChapterGroups,
  MediaChapters,
  MediaWithBanners,
  MediaWithCovers,
  MediaWithTitles,
} from "@taiyo/db";

const CDN_DOMAIN = "https://cdn.taiyo.moe";

const getCoverUrl = (media: MediaWithCovers) => {
  const firstCover = media.covers.at(0);

  return `${CDN_DOMAIN}/${media.id}/covers/${firstCover?.id}.jpg`;
};

const getBannerOrCoverUrl = (media: MediaWithBanners | MediaWithCovers) => {
  const firstBanner = "banners" in media ? media.banners.at(0) : null;

  if (!firstBanner && "covers" in media) return getCoverUrl(media);

  return `${CDN_DOMAIN}/${media.id}/banners/${firstBanner?.id}.jpg`;
};

const hasBanners = (media: MediaWithBanners) => {
  return media.banners.length > 0;
};

const getMainTitle = (media?: MediaWithTitles) => {
  const firstTitle = media?.titles.at(0);

  if (!firstTitle || !media) return null;

  return firstTitle.title;
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

export const MediaUtils = {
  getCoverUrl,
  getBannerOrCoverUrl,
  hasBanners,
  getMainTitle,
  computeVolumes,
};
