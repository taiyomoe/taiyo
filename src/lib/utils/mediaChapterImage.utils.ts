import { cloneDeep } from "lodash-es";

import { CDN_DOMAIN, PRELOAD_PAGES_COUNT } from "~/lib/constants";
import type {
  MediaChapterLimited,
  MediaChapterNavigation,
  MediaChapterPage,
  ReaderImage,
} from "~/lib/types";

const boundary = Math.floor(PRELOAD_PAGES_COUNT / 2);

const getImageUrl = (
  mediaChapter: MediaChapterLimited,
  page: MediaChapterPage,
) => {
  return `${CDN_DOMAIN}/${mediaChapter.media.id}/${mediaChapter.id}/${page.id}.jpg`;
};

const getImages = (mediaChapter: MediaChapterLimited) => {
  const images: Omit<ReaderImage, "blobUrl">[] = mediaChapter.pages.map(
    (page, index) => ({
      number: index + 1,
      url: getImageUrl(mediaChapter, page),
    }),
  );

  return images;
};

const getImagesChunk = (
  mediaChapter: MediaChapterLimited,
  navigation: MediaChapterNavigation,
) => {
  const images: Omit<ReaderImage, "blobUrl">[] = [];

  for (
    let i = navigation.currentPage - boundary;
    i <= navigation.currentPage + boundary;
    i += 1
  ) {
    if (i < 0 || i > mediaChapter.pages.length) {
      continue;
    }

    const page = mediaChapter.pages.at(i);

    if (page) {
      images.push({ number: i + 1, url: getImageUrl(mediaChapter, page) });
    }
  }

  return images;
};

const mergeImages = (
  mediaChapter: MediaChapterLimited,
  navigation: MediaChapterNavigation,
  images: ReaderImage[],
) => {
  const newChunk = getImagesChunk(mediaChapter, navigation);
  const imageNumbers = images.map((image) => image.number);
  const newImages: Omit<ReaderImage, "blobUrl">[] = cloneDeep(images);

  for (const image of newChunk) {
    if (!imageNumbers.includes(image.number)) {
      newImages.push(image);
    }
  }

  return newImages;
};

export const MediaChapterImageUtils = {
  getImageUrl,
  getImages,
  getImagesChunk,
  mergeImages,
};
