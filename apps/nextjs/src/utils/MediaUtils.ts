import type { LatestMedia, MediaLimited } from "@taiyo/db/types";

import { CDN_DOMAIN } from "./constants";

const getCoverUrl = (media: MediaLimited | LatestMedia) =>
  `${CDN_DOMAIN}/${media.id}/covers/${media.coverId}.jpg`;

const getBannerOrCoverUrl = (media: MediaLimited) =>
  `${CDN_DOMAIN}/${media.id}/banners/${media.bannerId}.jpg`;

export const MediaUtils = {
  getCoverUrl,
  getBannerOrCoverUrl,
};
