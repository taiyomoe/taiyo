"use client";

import { useAtomValue } from "jotai";

import { mediaChapterAtom } from "~/atoms/mediaChapter.atoms";
import { DisplayMediaChapterScans } from "~/components/ui/DisplayMediaChapterScans";

export const ReaderSettingsMediaChapterScans = () => {
  const chapter = useAtomValue(mediaChapterAtom);

  return (
    <DisplayMediaChapterScans
      scans={chapter?.scans}
      orientation="vertical"
      size="md"
    />
  );
};
