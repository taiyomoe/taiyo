import _ from "lodash-es";
import { create } from "zustand";

import type {
  InferNestedPaths,
  InferNestedValues,
  MediaChapterLimited,
  MediaChapterNavigation,
} from "~/lib/types";
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils";

export type ReaderSettings = {
  sidebar: {
    state: "show" | "hide";
    side: "left" | "right";
    openMode: "button" | "hover";
  };
  navbar: {
    mode: "sticky" | "hover";
  };
  pageMode: "single" | "longstrip";
};

export type ReaderState = {
  settings: ReaderSettings;

  chapter: MediaChapterLimited | null;
  navigation: MediaChapterNavigation | null;

  currentPage: {
    number: number;
    url: string;
  } | null;

  updateSettings: (
    key: InferNestedPaths<ReaderSettings>,
    newValue: InferNestedValues<ReaderSettings>,
  ) => void;

  load: (
    chapter: MediaChapterLimited,
    initialPageNumber: number | null,
  ) => void;
  unload: () => void;
};

export const useReaderStore = create<ReaderState>((set) => ({
  settings: {
    sidebar: {
      state: "hide",
      side: "right",
      openMode: "button",
    },
    navbar: {
      mode: "sticky",
    },
    pageMode: "single",
  },

  chapter: null,
  navigation: null,

  currentPage: null,

  updateSettings: (key, newValue) => {
    set((state) => {
      const newSettings = { ...state.settings };

      _.set(newSettings, key, newValue);

      return {
        ...state,
        settings: newSettings,
      };
    });
  },

  load: (chapter, initialPageNumber) => {
    const navigation = initialPageNumber
      ? MediaChapterUtils.getNavigation(chapter, initialPageNumber)
      : null;

    set((state) => ({
      ...state,
      chapter,
      navigation,
    }));
  },
  unload: () => set((state) => ({ ...state, chapter: null, navigation: null })),
}));
