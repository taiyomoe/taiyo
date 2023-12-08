import type { MediaCover } from "@prisma/client";

import { env } from "~/lib/env.mjs";
import type { MediaCoverVolume, MediaWithRelations } from "~/lib/types";

const getUrl = (media: { id: string; coverId: string }) =>
  `${env.NEXT_PUBLIC_CDN_URL}/medias/${media.id}/covers/${media.coverId}.jpg`;

const getLowestVolumeNumber = ({
  media,
  volumes,
}: {
  media?: MediaWithRelations;
  volumes?: MediaCoverVolume[];
}) => {
  if (media) {
    return media.covers
      .map((c) => c.volume)
      .filter(Boolean)
      .sort((a, b) => a - b)[0];
  }

  if (volumes) {
    return volumes.sort((a, b) => a.number - b.number)[0]?.number;
  }
};

const computeVolumes = (covers: MediaCover[]) => {
  const volumes = Array.from(
    new Set(covers.map((c) => c.volume).filter(Boolean)),
  )
    .sort((a, b) => a - b)
    .map((v) => ({
      number: v,
      covers: covers.filter((c) => c.volume === v),
    }));

  return volumes;
};

export const MediaCoverUtils = {
  getUrl,
  getLowestVolumeNumber,
  computeVolumes,
};
