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

  currentPageNumber: number | null;
  hasPreviousPage: boolean;
  hasNextPage: boolean;

  updateSettings: (
    key: InferNestedPaths<ReaderSettings>,
    newValue: InferNestedValues<ReaderSettings>,
  ) => void;

  load: (
    chapter: MediaChapterLimited,
    initialPageNumber: number | null,
  ) => void;
  updateNavigation: (newPageNumber: number) => void;
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

  currentPageNumber: null,
  hasPreviousPage: false,
  hasNextPage: false,

  updateSettings: (key, newValue) => {
    set((state) => {
      const newSettings = structuredClone(state.settings);

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
      currentPageNumber: initialPageNumber,
      hasPreviousPage: !!navigation?.previousPage,
      hasNextPage: !!navigation?.nextPage,
    }));
  },
  updateNavigation: (newPageNumber) => {
    set((state) => {
      if (!state.chapter) {
        return state;
      }

      const newNavigation = MediaChapterUtils.getNavigation(
        state.chapter,
        newPageNumber,
      )!;

      return {
        ...state,
        navigation: newNavigation,
        currentPageNumber: newNavigation.currentPage,
      };
    });
  },
  unload: () => set((state) => ({ ...state, chapter: null, navigation: null })),
}));
