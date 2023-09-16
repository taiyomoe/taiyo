import type { MediaWithRelations } from "@taiyo/db";

import { Skeleton } from "~/components/ui/Skeleton";
import { MediaUtils } from "~/utils/MediaUtils";

type Props = {
  media: MediaWithRelations | undefined;
};

export const MediaLayoutActions = ({ media }: Props) => {
  const mainTitle = MediaUtils.getMainTitle(media);

  return (
    <div className="grid h-28 grid-rows-2 bg-blue-900 bg-opacity-50 p-3 xl:h-36">
      <p className="line-clamp-1 h-fit text-3xl font-bold">{mainTitle}</p>
      <div className="grid w-full grid-cols-4 items-end gap-4 bg-yellow-900 bg-opacity-50">
        <Skeleton className="col-span-3 h-[40px] hover:cursor-not-allowed xl:h-[50px]" />
        <Skeleton className="col-span-1 h-[40px] hover:cursor-not-allowed xl:h-[50px]" />
        <Skeleton className="col-span-2 h-[40px] hover:cursor-not-allowed xl:h-[50px]" />
        <Skeleton className="col-span-1 h-[40px] hover:cursor-not-allowed xl:h-[50px]" />
      </div>
    </div>
  );
};
