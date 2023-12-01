import type { MediaStatus } from "@prisma/client";

import { db } from "~/lib/server/db";
import type { MediasIndexItem } from "~/lib/types/meilisearch.types";

/**
 * Gets the titles and main cover of a media.
 * This is used to populate the Meilisearch titles index.
 */
const getIndexItem = async (mediaId: string): Promise<MediasIndexItem> => {
  const result = await db.media.findUnique({
    select: {
      id: true,
      synopsis: true,
      titles: {
        select: {
          title: true,
          language: true,
          priority: true,
          isAcronym: true,
          isMainTitle: true,
        },
      },
      covers: {
        select: {
          id: true,
        },
        where: {
          isMainCover: true,
        },
      },
    },
    where: {
      id: mediaId,
    },
  });

  if (!result) {
    throw new Error(`Media ${mediaId} not found`);
  }

  if (!result.covers.length) {
    throw new Error(`Media ${mediaId} has no main cover`);
  }

  return {
    id: result.id,
    synopsis: result.synopsis,
    titles: result.titles,
    mainCoverId: result.covers[0]!.id,
  };
};

const getStatus = async (mediaId: string): Promise<MediaStatus> => {
  const result = await db.media.findUnique({
    select: { status: true },
    where: { id: mediaId },
  });

  if (!result) {
    throw new Error(`Media ${mediaId} not found`);
  }

  return result.status;
};

export const MediasService = {
  getIndexItem,
  getStatus,
};
