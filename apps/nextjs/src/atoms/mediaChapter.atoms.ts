import { atom } from "jotai";

import type {
  MediaChapterLimited,
  MediaChapterNavigation,
} from "@taiyo/db/types";

export const mediaChapterAtom = atom<MediaChapterLimited | null>(null);

export const mediaChapterTitleAtom = atom((get) => {
  const mediaChapter = get(mediaChapterAtom);

  return mediaChapter?.title ?? mediaChapter?.media.title ?? null;
});

export const mediaChapterNavigationAtom = atom<MediaChapterNavigation | null>(
  null,
);
