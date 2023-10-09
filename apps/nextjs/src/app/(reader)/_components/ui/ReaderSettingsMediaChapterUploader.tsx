"use client";

import { useAtomValue } from "jotai";

import { mediaChapterAtom } from "~/atoms/mediaChapter.atoms";
import { DisplayMediaChapterUploader } from "~/components/ui/DisplayMediaChapterUploader";

export const ReaderSettingsMediaChapterUploader = () => {
  const chapter = useAtomValue(mediaChapterAtom);

  return <DisplayMediaChapterUploader user={chapter?.user} size="md" />;
};
