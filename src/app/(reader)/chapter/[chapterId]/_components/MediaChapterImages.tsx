import { Spinner } from "@nextui-org/react";

import { useChapterImages } from "~/hooks/useChapterImages";
import { useChapterNavigation } from "~/hooks/useChapterNavigation";

import { MediaChapterImage } from "./MediaChapterImage";

export const MediaChapterImages = () => {
  const { currentPage } = useChapterNavigation();
  const { images, pageMode } = useChapterImages();

  const currentImage = images.find((img) => img.number === currentPage);

  return (
    <div className="mx-auto flex h-full flex-col items-center justify-center">
      {(images.length === 0 || !currentImage) && (
        <Spinner size="lg" className="justify-self-center" />
      )}
      {images.map((img) => (
        <MediaChapterImage
          key={img.url}
          url={img.blobUrl}
          hide={
            pageMode === "single" ? currentImage?.number !== img.number : false
          }
        />
      ))}
    </div>
  );
};
