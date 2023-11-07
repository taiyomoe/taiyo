import { useCallback, useMemo } from "react";
import { Spinner } from "@nextui-org/react";

import { useChapterNavigation } from "~/hooks/useChapterNavigation";
import type { ReaderImage } from "~/lib/types";
import { MediaChapterImageUtils } from "~/lib/utils/mediaChapterImage.utils";

import { DisplayMediaChapterImage } from "./DisplayMediaChapterImage";

export const DisplayMediaChapterImages = () => {
  const { chapter, currentPage } = useChapterNavigation();
  const images = useMemo(
    () =>
      chapter?.pages.map((page, i) => ({
        url: MediaChapterImageUtils.getImageUrl(chapter, page),
        number: i + 1,
      })) ?? [],
    [chapter],
  );

  const RenderImage = useCallback(
    ({ img }: { img: ReaderImage }) => (
      <DisplayMediaChapterImage
        url={img.url}
        hide={currentPage !== img.number}
      />
    ),
    [currentPage],
  );

  console.log(JSON.stringify(images, null, 2));

  return (
    <div className="mx-auto flex h-full items-center">
      {chapter?.pages.length === 0 && <Spinner size="lg" />}
      {/* {images.map((img) => (
        <RenderImage key={img.url} img={img} />
      ))} */}
      {images.map((img) => (
        <RenderImage key={img.url} img={img} />
      ))}
    </div>
  );
};
