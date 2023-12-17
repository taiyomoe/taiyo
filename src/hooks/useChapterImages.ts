import { useEffect, useRef, useState } from "react";
import { useDebounce } from "usehooks-ts";

import type { ReaderImage } from "~/lib/types";
import { MediaChapterImageUtils } from "~/lib/utils/mediaChapterImage.utils";
import { useReaderStore } from "~/stores";

export const useChapterImages = () => {
  const { chapter, navigation, settings } = useReaderStore();
  const [images, setImages] = useState<ReaderImage[]>([]);
  const previousCurrentPage = useRef<number | undefined>(
    navigation?.currentPage,
  );
  const [imagesToLoad, setImagesToLoad] = useState<
    Omit<ReaderImage, "blobUrl">[]
  >([]);
  const deboucedImagesToLoad = useDebounce(imagesToLoad, 200);

  const loadImageBlob = async (url: string) => {
    const image = await fetch(url).then((res) => res.blob());

    return URL.createObjectURL(image);
  };

  // Load images when the chapter or the current page changes in single page mode
  if (
    chapter &&
    navigation &&
    settings.pageMode === "single" &&
    (navigation.currentPage !== previousCurrentPage.current ||
      (images.length === 0 && imagesToLoad.length === 0))
  ) {
    previousCurrentPage.current = navigation.currentPage;

    const mergedImages = MediaChapterImageUtils.mergeImages(
      chapter,
      navigation,
      images,
    );
    const newImages = mergedImages
      .filter((x) => !images.some((y) => y.number === x.number))
      .filter((x) => !imagesToLoad.some((y) => y.number === x.number));

    if (newImages.length > 0) {
      setImagesToLoad((prev) => [...prev, ...newImages]);
    }
  }

  // Load all images on longstrip mode
  if (chapter && settings.pageMode === "longstrip") {
    const newImages = MediaChapterImageUtils.getImages(chapter)
      .filter((x) => !images.some((y) => y.number === x.number))
      .filter((x) => !imagesToLoad.some((y) => y.number === x.number));

    if (newImages.length > 0) {
      setImagesToLoad((prev) => [...prev, ...newImages]);
    }
  }

  useEffect(() => {
    if (deboucedImagesToLoad.length === 0) {
      return;
    }

    void Promise.all(
      deboucedImagesToLoad.map(async (image) => ({
        ...image,
        blobUrl: await loadImageBlob(image.url),
      })),
    ).then((newImages) => {
      console.log("loadedImages", newImages);

      setImages((prev) => [...prev, ...newImages]);
      setImagesToLoad((prev) =>
        prev.filter((x) => !newImages.some((y) => y.number === x.number)),
      );
    });
  }, [deboucedImagesToLoad]);

  return { images };
};
