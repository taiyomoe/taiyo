import { env } from "~/lib/env.mjs";

const getUrl = (media: { id: string; coverId: string }) =>
  `${env.NEXT_PUBLIC_CDN_URL}/medias/${media.id}/covers/${media.coverId}.jpg`;

export const MediaCoverUtils = {
  getUrl,
};
