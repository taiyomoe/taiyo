import { cloneDeep } from "lodash-es";

import { env } from "~/lib/env.mjs";
import type { UpdateMediaCoverSchema } from "~/lib/schemas";
import type { MediaCoverVolume, MediaWithRelations } from "~/lib/types";

const getUrl = (media: { id: string; coverId: string }) =>
  `${env.NEXT_PUBLIC_CDN_URL}/medias/${media.id}/covers/${media.coverId}.jpg`;

const getLowestVolumeNumber = (media: MediaWithRelations) => {
  return media.covers
    .map((c) => c.volume)
    .filter(Boolean)
    .sort((a, b) => a - b)[0];
};

const computeVolumes = (media: MediaWithRelations) => {
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

const computeVolumesUpdate = (
  previousVolumes: MediaCoverVolume[],
  updatedCover: UpdateMediaCoverSchema,
) => {
  const newVolumes = cloneDeep(previousVolumes);
  const previousVolumeNumber = newVolumes.find((v) =>
    v.covers.find((c) => c.id === updatedCover.id),
  )!.number;
  const prevVolumeIndex = newVolumes.findIndex(
    (v) => v.number === previousVolumeNumber,
  )!;
  const prevVolume = newVolumes[prevVolumeIndex]!;
  const prevCover = prevVolume.covers.find((c) => c.id === updatedCover.id)!;

  prevVolume.covers.splice(
    prevVolume.covers.findIndex((c) => c.id === updatedCover.id),
    1,
  );

  if (prevVolume.covers.length === 0) {
    newVolumes.splice(prevVolumeIndex, 1);
  }

  const newVolumeIndex = newVolumes.findIndex(
    (v) => v.number === updatedCover.volume,
  );

  if (newVolumeIndex === -1) {
    newVolumes.push({
      number: updatedCover.volume!,
      covers: [{ ...prevCover, ...updatedCover }],
    });
  } else {
    const newVolume = newVolumes[newVolumeIndex]!;
    newVolume.covers.push({ ...prevCover, ...updatedCover });
  }

  return newVolumes;
};

export const MediaCoverUtils = {
  getUrl,
  getLowestVolumeNumber,
  computeVolumes,
  computeVolumesUpdate,
};
