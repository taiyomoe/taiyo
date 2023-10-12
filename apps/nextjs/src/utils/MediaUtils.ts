import type { LatestMedia, MediaLimited } from "@taiyo/db/types";
import { CDN_DOMAIN } from "@taiyo/utils";

const getCoverUrl = (media: MediaLimited | LatestMedia) =>
  `${CDN_DOMAIN}/${media.id}/covers/${media.coverId}.jpg`;

const getBannerOrCoverUrl = (media: MediaLimited) => {
  if (!media.bannerId) return getCoverUrl(media);

  return `${CDN_DOMAIN}/${media.id}/banners/${media.bannerId}.jpg`;
};

export const MediaUtils = {
  getCoverUrl,
  getBannerOrCoverUrl,
};
