import _, { omit } from "lodash-es";
import { create } from "zustand";

import type {
  InferNestedPaths,
  InferNestedValues,
  MediaChapterLimited,
  MediaChapterNavigation,
  ReaderImage,
  ReaderSettings,
} from "~/lib/types";
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils";
import { MediaChapterImageUtils } from "~/lib/utils/mediaChapterImage.utils";

type State = {
  settings: ReaderSettings;

  chapter: MediaChapterLimited | null;
  navigation: MediaChapterNavigation | null;

  currentPageNumber: number | null;
  hasPreviousPage: boolean;
  hasNextPage: boolean;

  loadedImages: string[];
  images: Record<string, ReaderImage[]>;
};

type Actions = {
  updateSettings: (
    key: InferNestedPaths<ReaderSettings>,
    newValue: InferNestedValues<ReaderSettings>,
  ) => void;

  updateNavigation: (newPageNumber: number) => void;

  getImages: () => ReaderImage[];
  loadImage: (url: string) => Promise<string>;
  loadImageBatch: (
    images: { number: number; url: string }[],
    chapterId: string,
  ) => void;
  loadAllImages: () => void;
  updateImages: (newPageNumber: number) => void;

  load: (
    chapter: MediaChapterLimited,
    initialPageNumber: number | null,
  ) => void;
};

export const useReaderStore = create<State & Actions>((set, get) => ({
  settings: {
    sidebar: {
      state: "hide",
      side: "right",
      openMode: "button",
    },
    navbarMode: "hover",
    page: {
      mode: "single",
      overlay: "hide",
      height: "fit",
      width: "fit",
      brightness: 100,
    },
  },

  chapter: null,
  navigation: null,

  currentPageNumber: null,
  hasPreviousPage: false,
  hasNextPage: false,

  loadedImages: [],
  images: {},

  updateSettings: (key, newValue) => {
    // Load all images on longstrip mode
    if (key === "page.mode" && newValue === "longstrip") {
      void get().loadAllImages();
    }

    set((state) => {
      const newSettings = structuredClone(state.settings);

      _.set(newSettings, key, newValue);

      // If the user is trying to open the sidebar while the page overlay is open, close the overlay
      if (key === "sidebar.state" && newValue === "show") {
        _.set(newSettings, "page.overlay", "hide");
      }

      // If the user is trying to open the page overlay while the sidebar is open, stop him
      if (
        key === "page.overlay" &&
        newValue === "show" &&
        state.settings.sidebar.state === "show"
      ) {
        return state;
      }

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

  /**
   * Gets all loaded images for the given chapter.
   *
   * @returns chapter images or empty array if chapter is not loaded
   */
  getImages: () => {
    const { chapter, images } = get();

    return images[chapter?.id ?? ""] ?? [];
  },

  /**
   * Loads a single image from the given url.
   *
   * @param url image original url
   * @returns image blob url
   */
  loadImage: async (url) => {
    const image = await fetch(url).then((res) => res.blob());

    return URL.createObjectURL(image);
  },

  /**
   * Loads a batch of images from the given urls.
   *
   * @param urls images original urls
   * @returns images blob urls
   */
  loadImageBatch: (images, chapterId) => {
    set((state) => ({
      ...state,
      loadedImages: state.loadedImages.concat(images.map((x) => x.url)),
    }));

    void Promise.all(
      images.map(async (image) => ({
        number: image.number,
        url: image.url,
        blobUrl: await get().loadImage(image.url),
      })),
    ).then((newImages) => {
      set((state) => ({
        ...state,
        images: {
          ...state.images,
          [chapterId]: state.images[chapterId]!.concat(
            newImages.map((x) => omit(x, "url")),
          ),
        },
      }));
    });
  },

  /**
   * Loads all images from the current chapter.
   *
   * This will not load images that are already loaded.
   */
  loadAllImages: () => {
    const { chapter, loadedImages, images, loadImageBatch } = get();
    const chapterImages = images[chapter?.id ?? ""];

    if (!chapter || !chapterImages) {
      return;
    }

    const allImages = MediaChapterImageUtils.getAllImages(chapter);
    const newImages = allImages
      .filter((x) => !chapterImages.some((y) => y.number === x.number))
      .filter((x) => !loadedImages.includes(x.url));

    loadImageBatch(newImages, chapter.id);
  },

  /**
   * Does all the necessary work to load images based on the current page number.
   *
   * This means that it will load the current page and the pages around it.
   * Of course, it will not load images that are already loaded.
   */
  updateImages: (newPageNumber) => {
    const { settings, chapter, loadedImages, images, loadImageBatch } = get();
    const chapterImages = images[chapter?.id ?? ""];

    if (settings.page.mode === "longstrip" || !chapter || !chapterImages) {
      return;
    }

    const imagesChunk = MediaChapterImageUtils.getImagesChunk(
      chapter,
      newPageNumber,
    );
    const newImages = imagesChunk
      .filter((x) => !chapterImages.some((y) => y.number === x.number))
      .filter((x) => !loadedImages.includes(x.url));

    loadImageBatch(newImages, chapter.id);
  },

  load: (chapter, initialPageNumber) => {
    const { settings, updateSettings, updateNavigation } = get();
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
      loadedImages: [],
      images: state.images[chapter.id]
        ? state.images
        : { ...state.images, [chapter.id]: [] },
    }));

    if (chapter.media.type === "MANHWA" && settings.page.mode !== "longstrip") {
      updateSettings("page.mode", "longstrip");
    } else {
      updateNavigation(initialPageNumber ?? 1);
    }
  },
}));
