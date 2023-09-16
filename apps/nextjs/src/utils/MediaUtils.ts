import type {
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

export const MediaUtils = {
  getCoverUrl,
  getBannerUrl,
  getMainTitle,
};
