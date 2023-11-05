import type { UploadSessionType } from "@prisma/client";
import { useAtomValue } from "jotai";

import { selectedImagesAtom } from "~/atoms/imageCompression.atoms";

import { ImageCard } from "./ImageCard";

type Props = { type: UploadSessionType };

export const ImageShowcase = ({ type }: Props) => {
  const selectedImages = useAtomValue(selectedImagesAtom).filter(
    (x) => x.type === type,
  );

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
