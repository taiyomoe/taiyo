import { Skeleton } from "@nextui-org/skeleton";

import type { MediaLimited } from "~/lib/types";

type Props = {
  media: MediaLimited;
};

export const MediaLayoutActions = ({ media }: Props) => {
  return (
    <div className="flex h-28 flex-col gap-2 py-3 xl:h-36">
      <div className="h-full">
        <p className="line-clamp-1 h-[44px] text-center text-2xl font-bold [text-shadow:_0_3px_0_rgb(0_0_0_/_40%)] md:text-left md:text-4xl">
          {media.mainTitle}
        </p>
      </div>
      <div className="flex h-full gap-4">
        <Skeleton className="h-full w-1/4 rounded hover:cursor-not-allowed" />
        <Skeleton className="h-full w-2/4 rounded hover:cursor-not-allowed" />
      </div>
    </div>
  );
};
