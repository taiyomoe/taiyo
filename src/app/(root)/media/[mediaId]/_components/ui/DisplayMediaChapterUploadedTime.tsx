import { ClockIcon } from "lucide-react";

import { type MediaLimitedChapter } from "~/lib/types";
import { MediaChapterUtils } from "~/utils/MediaChapterUtils";

type Props = {
  chapter: MediaLimitedChapter;
};

export const DisplayMediaChapterUploadedTime = ({ chapter }: Props) => {
  return (
    <div className="flex w-full items-center justify-end gap-1 md:justify-start">
      <ClockIcon className="h-4 w-fit md:h-5" />
      <p className="select-none rounded px-1 text-sm md:px-2">
        {MediaChapterUtils.computeUploadedTime(chapter)}
      </p>
    </div>
  );
};
