"use client";

import { useAtomValue } from "jotai";

import { mediaChapterAtom } from "~/atoms/mediaChapter.atoms";
import { DisplayMediaChapterScans } from "~/components/ui/DisplayMediaChapterScans";
import { DisplayMediaChapterUploader } from "~/components/ui/DisplayMediaChapterUploader";

type Props = {
  className: string;
};

export const ReaderSidebarUploadersSection = ({ className }: Props) => {
  const chapter = useAtomValue(mediaChapterAtom);

  return (
    <div className={className}>
      <p className="text-md font-medium">Upado por</p>
      <div className="flex flex-col gap-2">
        <DisplayMediaChapterUploader user={chapter?.user} size="md" />
        <DisplayMediaChapterScans
          scans={chapter?.scans}
          orientation="vertical"
          size="md"
        />
      </div>
    </div>
  );
};
