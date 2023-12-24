import { Spinner } from "@nextui-org/react";

import { useChapterProgression } from "~/hooks/useChapterProgression";
import { useReaderStore } from "~/stores";

import { MediaChapterImage } from "./MediaChapterImage";

export const MediaChapterImages = () => {
  const { settings, currentPageNumber, getImages } = useReaderStore();
  const images = getImages();
  const currentImage = images.find((img) => img.number === currentPageNumber);

  useChapterProgression();

  if (images.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" className="m-4 justify-self-center" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full flex-col items-center justify-center">
      {images
        .sort((a, b) => a.number - b.number)
        .map((img) => (
          <MediaChapterImage
            key={img.blobUrl}
            url={img.blobUrl}
            hide={
              settings.page.mode === "single"
                ? currentImage?.number !== img.number
                : false
            }
          />
        ))}
    </div>
  );
};
