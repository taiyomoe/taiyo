import type { MediaType } from "@prisma/client";
import _ from "lodash-es";
import { create } from "zustand";

import type {
  InferNestedPaths,
  InferNestedValues,
  MediaChapterLimited,
  MediaChapterNavigation,
} from "~/lib/types";
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils";
import { MediaChapterImageUtils } from "~/lib/utils/mediaChapterImage.utils";

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

  loadingImages: number[];
  images: { number: number; blobUrl: string }[];

  updateSettings: (
    key: InferNestedPaths<ReaderSettings>,
    newValue: InferNestedValues<ReaderSettings>,
  ) => void;

  updateNavigation: (newPageNumber: number) => void;

  loadImage: (url: string) => Promise<string>;
  loadAllImages: () => void;
  updateImages: (newPageNumber: number) => void;

  load: (
    chapter: MediaChapterLimited,
    initialPageNumber: number | null,
    mediaType: MediaType,
  ) => void;
  unload: () => void;
};

export const useReaderStore = create<ReaderState>((set, get) => ({
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

  loadingImages: [],
  images: [],

  updateSettings: (key, newValue) => {
    // Load all images on longstrip mode
    if (key === "pageMode" && newValue === "longstrip") {
      void get().loadAllImages();
    }

    set((state) => {
      const newSettings = structuredClone(state.settings);

      _.set(newSettings, key, newValue);

      return {
        ...state,
        settings: newSettings,
      };
    });
  },

  updateNavigation: (newPageNumber) => {
    get().updateImages(newPageNumber);

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
        hasPreviousPage: !!newNavigation.previousPage,
        hasNextPage: !!newNavigation.nextPage,
      };
    });
  },

  loadImage: async (url) => {
    const image = await fetch(url).then((res) => res.blob());

    return URL.createObjectURL(image);
  },
  loadAllImages: () => {
    const { chapter, loadingImages, images } = get();

    if (!chapter) {
      return;
    }

    const allImages = MediaChapterImageUtils.getAllImages(chapter);
    const newImages = allImages
      .filter((x) => !images.some((y) => y.number === x.number))
      .filter((x) => !loadingImages.includes(x.number));

    set((state) => ({
      ...state,
      loadingImages: [
        ...state.loadingImages,
        ...newImages.map((x) => x.number),
      ],
    }));

    void Promise.all(
      newImages.map(async (image) => ({
        number: image.number,
        blobUrl: await get().loadImage(image.url),
      })),
    ).then((newImages) => {
      set((state) => ({
        ...state,
        loadingImages: state.loadingImages.filter(
          (x) => !newImages.some((y) => y.number === x),
        ),
        images: [...state.images, ...newImages],
      }));
    });
  },
  updateImages: (newPageNumber) => {
    const { settings, chapter, loadingImages, images } = get();

    if (settings.pageMode === "longstrip" || !chapter) {
      return;
    }

    const imagesChunk = MediaChapterImageUtils.getImagesChunk(
      chapter,
      newPageNumber,
    );
    const newImages = imagesChunk
      .filter((x) => !images.some((y) => y.number === x.number))
      .filter((x) => !loadingImages.includes(x.number));

    set((state) => ({
      ...state,
      loadingImages: [
        ...state.loadingImages,
        ...newImages.map((x) => x.number),
      ],
    }));

    for (const { number, url } of newImages) {
      void get()
        .loadImage(url)
        .then((blobUrl) => {
          set((state) => {
            if (state.images.some((x) => x.number === number)) {
              return {
                ...state,
                loadingImages: state.loadingImages.filter((x) => x !== number),
              };
            }

            return {
              ...state,
              loadingImages: state.loadingImages.filter((x) => x !== number),
              images: [...state.images, { number, blobUrl }],
            };
          });
        });
    }
  },

  load: (chapter, initialPageNumber, mediaType) => {
    const { settings, updateSettings, updateImages } = get();
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
      loadingImages: [],
      images: [],
    }));

    if (mediaType === "MANHWA" && settings.pageMode !== "longstrip") {
      updateSettings("pageMode", "longstrip");
    } else {
      updateImages(initialPageNumber ?? 1);
    }
  },
  unload: () =>
    set((state) => ({
      ...state,
      chapter: null,
      navigation: null,
      images: [],
      loadingImages: [],
    })),
}));
