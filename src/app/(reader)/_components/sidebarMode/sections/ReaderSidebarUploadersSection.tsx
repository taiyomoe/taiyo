"use client";

import { useAtomValue } from "jotai";

import { mediaChapterAtom } from "~/atoms/mediaChapter.atoms";
import { MediaChapterScans } from "~/components/ui/MediaChapterScans";
import { MediaChapterUploader } from "~/components/ui/MediaChapterUploader";

type Props = {
  className: string;
};

export const ReaderSidebarUploadersSection = ({ className }: Props) => {
  const chapter = useAtomValue(mediaChapterAtom);

  return (
    <div className={className}>
      <p className="text-md font-medium">Upado por</p>
      <div className="flex flex-col gap-2">
        <MediaChapterUploader uploader={chapter?.uploader} size="md" />
        <MediaChapterScans
          scans={chapter?.scans}
          orientation="vertical"
          size="md"
        />
      </div>
    </div>
  );
};
