import { CDN_DOMAIN } from "~/lib/constants";
import type { LatestMedia, MediaLimited } from "~/lib/types";

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
