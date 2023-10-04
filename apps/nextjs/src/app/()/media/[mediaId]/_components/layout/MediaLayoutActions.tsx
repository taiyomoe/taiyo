"use client";

import { Skeleton } from "@nextui-org/skeleton";

import type { MediaWithRelations } from "@taiyo/db/types";

import { MediaUtils } from "~/utils/MediaUtils";

type Props = {
  media: MediaWithRelations;
};

export const MediaLayoutActions = ({ media }: Props) => {
  const mainTitle = MediaUtils.getMainTitle(media);

  return (
    <div className="grid h-28 grid-rows-2 p-3 xl:h-36">
      <p className="line-clamp-1 h-fit w-fit text-3xl font-bold drop-shadow-lg">
        {mainTitle}
      </p>
      <div className="flex w-full gap-4">
        <Skeleton className="h-full w-1/4 rounded hover:cursor-not-allowed" />
        <Skeleton className="h-full w-2/4 rounded hover:cursor-not-allowed" />
        <Skeleton className="h-full w-full rounded hover:cursor-not-allowed" />
      </div>
    </div>
  );
};
