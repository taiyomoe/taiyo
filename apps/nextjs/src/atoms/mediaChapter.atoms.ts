import { atom } from "jotai";

import type {
  MediaChapterLimited,
  MediaChapterNavigation,
} from "@taiyo/db/types";

export const mediaChapterAtom = atom<MediaChapterLimited | null>(null);

export const mediaChapterTitleAtom = atom((get) => {
  const mediaChapter = get(mediaChapterAtom);

  return {
    id: mediaChapter?.media.id ?? null,
    title: mediaChapter?.title ?? mediaChapter?.media.title ?? null,
    isMediaTitle: mediaChapter?.title !== undefined,
  };
});

export const mediaChapterNavigationAtom = atom<MediaChapterNavigation | null>(
  null,
);
