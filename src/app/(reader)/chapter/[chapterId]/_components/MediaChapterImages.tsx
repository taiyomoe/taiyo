import { Spinner } from "@nextui-org/react";

import { useChapterProgression } from "~/hooks/useChapterProgression";
import { useReaderStore } from "~/stores";

import { MediaChapterImage } from "./MediaChapterImage";

export const MediaChapterImages = () => {
  const { settings, currentPageNumber, images } = useReaderStore();
  useChapterProgression();

  const currentImage = images.find((img) => img.number === currentPageNumber);

  return (
    <div className="mx-auto flex h-full flex-col items-center justify-center">
      {(images.length === 0 || !currentImage) && (
        <Spinner size="lg" className="m-4 justify-self-center" />
      )}
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
