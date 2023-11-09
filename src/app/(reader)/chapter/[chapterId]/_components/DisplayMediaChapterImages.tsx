import { Spinner } from "@nextui-org/react";

import { useChapterImages } from "~/hooks/useChapterImages";
import { useChapterNavigation } from "~/hooks/useChapterNavigation";

import { DisplayMediaChapterImage } from "./DisplayMediaChapterImage";

export const DisplayMediaChapterImages = () => {
  const { currentPage } = useChapterNavigation();
  const { images } = useChapterImages();
  const currentImage = images.find((img) => img.number === currentPage);

  return (
    <div className="mx-auto flex h-full items-center">
      {(images.length === 0 || !currentImage) && <Spinner size="lg" />}
      {images.map((img) => (
        <DisplayMediaChapterImage
          key={img.url}
          url={img.blobUrl}
          hide={currentImage?.number !== img.number}
        />
      ))}
    </div>
  );
};
