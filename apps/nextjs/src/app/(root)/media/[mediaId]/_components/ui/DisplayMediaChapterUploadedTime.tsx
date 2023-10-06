import { ClockIcon } from "lucide-react";

import type { MediaChapter } from "@taiyo/db/types";

import { MediaChapterUtils } from "~/utils/MediaChapterUtils";

type Props = {
  chapter: MediaChapter;
};

export const DisplayMediaChapterUploadedTime = ({ chapter }: Props) => {
  return (
    <div className="flex w-full items-center justify-end gap-1 bg-green-100 md:justify-start">
      <ClockIcon className="bg-red-100" size={20} />
      <p className="select-none rounded bg-blue-100 px-1 text-sm md:px-2">
        {MediaChapterUtils.computeUploadedTime(chapter)}
      </p>
    </div>
  );
};
