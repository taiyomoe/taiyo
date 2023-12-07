import type { MediaCover } from "@prisma/client";
import { cloneDeep } from "lodash-es";

import { env } from "~/lib/env.mjs";
import type { UpdateMediaCoverSchema } from "~/lib/schemas";
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

const computeVolumesAddition = (
  volumes: MediaCoverVolume[],
  newCovers: MediaCover[],
) => {
  const newVolumes = cloneDeep(volumes);

  newCovers.forEach((cover) => {
    const newVolumeIndex = newVolumes.findIndex(
      (v) => v.number === cover.volume,
    );

    if (newVolumeIndex === -1) {
      newVolumes.push({
        number: cover.volume!,
        covers: [cover],
      });
    } else {
      const newVolume = newVolumes[newVolumeIndex]!;
      newVolume.covers.push(cover);
    }
  });

  return newVolumes.sort((a, b) => a.number - b.number);
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

  if (updatedCover.isMainCover) {
    newVolumes.forEach((v) => {
      v.covers.forEach((c) => {
        if (c.id !== updatedCover.id) {
          c.isMainCover = false;
        }
      });
    });
  }

  return newVolumes.sort((a, b) => a.number - b.number);
};

export const MediaCoverUtils = {
  getUrl,
  getLowestVolumeNumber,
  computeVolumes,
  computeVolumesAddition,
  computeVolumesUpdate,
};
