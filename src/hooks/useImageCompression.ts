import { useCallback } from "react";
import { useAtom } from "jotai";
import { toast } from "sonner";

import {
  needsCompressionAtom,
  selectedImagesAtom,
} from "~/atoms/imageCompression.atoms";
import { ImageUtils } from "~/lib/utils/image.utils";

export const useImageCompression = () => {
  const [selectedImages, setSelectedImages] = useAtom(selectedImagesAtom);
  const [needsCompression, setNeedsCompression] = useAtom(needsCompressionAtom);

  const handleCompressImages = useCallback(() => {
    const promise = () =>
      Promise.all(
        selectedImages
          .filter((img) => img.file.type !== "image/jpeg")
          .map(async (img) => {
            setSelectedImages((prev) =>
              prev.map((i) =>
                i.file.name === img.file.name
                  ? { ...i, status: "compressing" }
                  : i,
              ),
            );

            const result = await ImageUtils.convert(img.file);

            setSelectedImages((prev) =>
              prev.map((i) =>
                i.file.name === img.file.name
                  ? { ...i, file: result, status: "compressed" }
                  : i,
              ),
            );
          }),
      ).finally(() => {
        setNeedsCompression(false);
      });

    toast.promise(promise, {
      loading: "Comprimindo imagens...",
      success: "Imagens comprimidas!",
      error: "Ocorreu um erro ao comprimir as imagens.",
    });
  }, [selectedImages, setNeedsCompression, setSelectedImages]);

  return {
    needsCompression,
    handleCompressImages,
  };
};
