import type {
  MediaChapters,
  MediaWithBanners,
  MediaWithCovers,
  MediaWithTitles,
} from "@taiyo/db";

const CDN_DOMAIN = "https://cdn.taiyo.moe";

const getCoverUrl = (media?: MediaWithCovers) => {
  const firstCover = media?.covers.at(0);

  if (!firstCover || !media) return null;

  return `${CDN_DOMAIN}/${media.id}/covers/${firstCover.id}.jpg`;
};

const getBannerUrl = (media?: MediaWithBanners) => {
  const firstBanner = media?.banners.at(0);

  if (!firstBanner || !media) return null;

  return `${CDN_DOMAIN}/${media.id}/banners/${firstBanner.id}.jpg`;
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

  return Object.entries(volumes).map(([volume, chapters]) => ({
    volume,
    chapters,
  }));
};

export const MediaUtils = {
  getCoverUrl,
  getBannerUrl,
  getMainTitle,
  computeVolumes,
};
