import { omit } from "lodash-es";
import { create } from "zustand";

import type {
  MediaChapterLimited,
  MediaChapterNavigation,
  ReaderImage,
} from "~/lib/types";
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils";
import { MediaChapterImageUtils } from "~/lib/utils/mediaChapterImage.utils";
import { useReaderSettingsStore } from "~/stores";

type State = {
  chapter: MediaChapterLimited | null;
  navigation: MediaChapterNavigation | null;

  currentPageNumber: number | null;
  hasPreviousPage: boolean;
  hasNextPage: boolean;

  loadedImages: string[];
  images: Record<string, ReaderImage[]>;
};

type Actions = {
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
  chapter: null,
  navigation: null,

  currentPageNumber: null,
  hasPreviousPage: false,
  hasNextPage: false,

  loadedImages: [],
  images: {},

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
    const { chapter, loadedImages, images, loadImageBatch } = get();
    const chapterImages = images[chapter?.id ?? ""];
    const settings = useReaderSettingsStore.getState();

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
    const { updateNavigation } = get();
    const settings = useReaderSettingsStore.getState();
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

    settings.update("sidebar.state", "hide");
    settings.update("page.overlay", "hide");

    if (chapter.media.type === "MANHWA") {
      settings.update("page.mode", "longstrip");
    }

    if (settings.page.mode !== "longstrip") {
      updateNavigation(initialPageNumber ?? 1);
    }
  },
}));
