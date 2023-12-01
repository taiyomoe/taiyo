import { useEffect, useRef, useState } from "react";
import { useSetAtom } from "jotai";

import { mediaChapterAtom } from "~/atoms/mediaChapter.atoms";
import type { ReaderImage } from "~/lib/types";
import { MediaChapterImageUtils } from "~/lib/utils/mediaChapterImage.utils";
import { useReaderStore } from "~/stores";

import { useChapterNavigation } from "./useChapterNavigation";

export const useChapterImages = () => {
  const { chapter, settings } = useReaderStore();
  const { navigation } = useChapterNavigation();
  const [images, setImages] = useState<ReaderImage[]>([]);
  const previousCurrentPage = useRef<number | undefined>(
    navigation?.currentPage,
  );

  const setChapter = useSetAtom(mediaChapterAtom);

  const loadImage = async (url: string) => {
    const image = await fetch(url).then((res) => res.blob());

    return URL.createObjectURL(image);
  };

  if (
    chapter &&
    navigation &&
    (navigation.currentPage !== previousCurrentPage.current ||
      images.length === 0)
  ) {
    previousCurrentPage.current = navigation.currentPage;

    if (settings.pageMode === "single") {
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

    if (settings.pageMode === "longstrip") {
      void Promise.all(
        MediaChapterImageUtils.getImages(chapter).map(async (image) => ({
          ...image,
          blobUrl: await loadImage(image.url),
        })),
      ).then(setImages);
    }
  }

  useEffect(() => {
    return () => {
      setChapter(null);
    };
  }, [setChapter]);

  return { images };
};
