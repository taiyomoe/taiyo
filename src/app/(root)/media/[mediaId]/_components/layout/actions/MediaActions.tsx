import { Skeleton } from "@nextui-org/skeleton";

import type { MediaLimited } from "~/lib/types";

type Props = {
  media: MediaLimited;
};

export const MediaActions = ({ media }: Props) => {
  return (
    <div className="grid h-28 grid-rows-2 gap-2 p-3 xl:h-36">
      <p className="line-clamp-1 h-[44px] w-fit text-4xl font-bold [text-shadow:_0_3px_0_rgb(0_0_0_/_40%)]">
        {media.title}
      </p>
      <div className="flex w-full gap-4">
        <Skeleton className="h-full w-1/4 rounded hover:cursor-not-allowed" />
        <Skeleton className="h-full w-2/4 rounded hover:cursor-not-allowed" />
        <Skeleton className="h-full w-full rounded hover:cursor-not-allowed" />
      </div>
    </div>
  );
};
