const CDN_DOMAIN = "https://cdn.taiyo.moe";

export const buildCoverUrl = (mediaId: string, coverId: string) =>
  `${CDN_DOMAIN}/${mediaId}/covers/${coverId}.jpg`;
