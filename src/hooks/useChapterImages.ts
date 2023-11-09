import { useRef, useState } from "react";
import { useAtomValue } from "jotai";

import { readerPageModeAtom } from "~/atoms/readerSettings.atoms";
import type { ReaderImage } from "~/lib/types";
import { MediaChapterImageUtils } from "~/lib/utils/mediaChapterImage.utils";

import { useChapterNavigation } from "./useChapterNavigation";

export const useChapterImages = () => {
  const { chapter, navigation } = useChapterNavigation();
  const [images, setImages] = useState<ReaderImage[]>([]);
  const previousCurrentPage = useRef<number | undefined>(
    navigation?.currentPage,
  );
  const pageMode = useAtomValue(readerPageModeAtom);

  const loadImage = async (url: string) => {
    const image = await fetch(url).then((res) => res.blob());

    return URL.createObjectURL(image);
  };

  if (
    chapter &&
    navigation &&
    navigation.currentPage !== previousCurrentPage.current
  ) {
    previousCurrentPage.current = navigation.currentPage;

    if (pageMode === "single") {
      const mergedImages = MediaChapterImageUtils.mergeImages(
        chapter,
        navigation,
        images,
      );

      void Promise.all(
        mergedImages
          .filter((x) => !images.some((y) => y.number === x.number))
          .map(async (image) => ({
            ...image,
            blobUrl: await loadImage(image.url),
          })),
      ).then((newImages) => setImages([...images, ...newImages]));
    }

    if (pageMode === "longstrip" && images.length === 0) {
      void Promise.all(
        MediaChapterImageUtils.getImages(chapter).map(async (image) => ({
          ...image,
          blobUrl: await loadImage(image.url),
        })),
      ).then(setImages);
    }
  }

  return { images, pageMode };
};
