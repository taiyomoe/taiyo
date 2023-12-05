import { env } from "~/lib/env.mjs";
import type { MediaWithRelations } from "~/lib/types";

const getUrl = (media: { id: string; coverId: string }) =>
  `${env.NEXT_PUBLIC_CDN_URL}/medias/${media.id}/covers/${media.coverId}.jpg`;

const getVolumes = (media: MediaWithRelations) => {
  const volumes = Array.from(
    new Set(media.covers.map((c) => c.volume).filter(Boolean)),
  )
    .sort((a, b) => a - b)
    .map((v) => ({
      number: v,
      covers: media.covers.filter((c) => c.volume === v),
    }));

  return volumes;
};

const getLowestVolume = (media: MediaWithRelations) => {
  return media.covers
    .map((c) => c.volume)
    .filter(Boolean)
    .sort((a, b) => a - b)[0];
};

export const MediaCoverUtils = {
  getUrl,
  getVolumes,
  getLowestVolume,
};
