import { useRef, useState } from "react";

import type { ReaderImage } from "~/lib/types";
import { MediaChapterImageUtils } from "~/lib/utils/mediaChapterImage.utils";
import { useReaderStore } from "~/stores";

export const useChapterImages = () => {
  const { chapter, navigation, settings } = useReaderStore();
  const [images, setImages] = useState<ReaderImage[]>([]);
  const previousCurrentPage = useRef<number | undefined>(
    navigation?.currentPage,
  );
  const [currentlyLoading, setCurrentlyLoading] = useState<string[]>([]);
  const [fetchedLongstrip, setFetchedLongstrip] = useState(false);

  const loadImage = async (url: string) => {
    setCurrentlyLoading((prev) => [...prev, url]);
    const image = await fetch(url).then((res) => res.blob());

    return URL.createObjectURL(image);
  };

  // Load images when the chapter or the current page changes in single page mode
  if (
    chapter &&
    navigation &&
    settings.pageMode === "single" &&
    (navigation.currentPage !== previousCurrentPage.current ||
      images.length === 0)
  ) {
    previousCurrentPage.current = navigation.currentPage;

    const mergedImages = MediaChapterImageUtils.mergeImages(
      chapter,
      navigation,
      images,
    );

    void Promise.all(
      mergedImages
        .filter((x) => !images.some((y) => y.number === x.number))
        .filter((x) => !currentlyLoading.includes(x.url))
        .map(async (image) => ({
          ...image,
          blobUrl: await loadImage(image.url),
        })),
    ).then((newImages) => setImages([...images, ...newImages]));
  }

  // Load all images on longstrip mode
  if (
    chapter &&
    settings.pageMode === "longstrip" &&
    fetchedLongstrip === false
  ) {
    void Promise.all(
      MediaChapterImageUtils.getImages(chapter)
        .filter((x) => !images.some((y) => y.number === x.number))
        .filter((x) => !currentlyLoading.includes(x.url))
        .map(async (image) => ({
          ...image,
          blobUrl: await loadImage(image.url),
        })),
    )
      .then((newImages) => setImages([...images, ...newImages]))
      .finally(() => {
        setFetchedLongstrip(true);
      });
  }

  return { images };
};
