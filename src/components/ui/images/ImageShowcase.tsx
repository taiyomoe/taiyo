import { useAtomValue } from "jotai";

import { selectedImagesAtom } from "~/atoms/imageCompression.atoms";
import { ImageCard } from "./ImageCard";

export const ImageShowcase = () => {
  const selectedImages = useAtomValue(selectedImagesAtom);

  return (
    <div className="flex flex-col gap-2">
      {selectedImages.map(({ file, status }, i) => (
        <ImageCard
          key={file.name}
          file={file}
          status={status}
          position={`${i + 1}/${selectedImages.length}`}
        />
      ))}
    </div>
  );
};
