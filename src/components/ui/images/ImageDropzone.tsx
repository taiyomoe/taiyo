import { useCallback, useEffect } from "react";
import { tv } from "@nextui-org/react";
import { useAtom, useSetAtom } from "jotai";
import { useDropzone, type DropzoneProps } from "react-dropzone";

import {
  needsCompressionAtom,
  selectedImagesAtom,
} from "~/atoms/imageCompression.atoms";
import { ImageSelection } from "./ImageSelection";
import { ImageShowcase } from "./ImageShowcase";

type Props = { compact?: boolean };

const imageDropzone = tv({
  slots: {
    container:
      "min-h-unit-24 w-full rounded-medium border border-dashed border-default-300 bg-default-100 p-3 transition-all !duration-150",
  },
  variants: {
    disabled: {
      false: {
        container: "hover:cursor-pointer hover:bg-default-200",
      },
    },
  },
});

export const ImageDropzone = ({ compact }: Props) => {
  const [selectedImages, setSelectedImages] = useAtom(selectedImagesAtom);
  const setNeedsCompression = useSetAtom(needsCompressionAtom);

  const shouldDisableDropzone = selectedImages.length !== 0;
  const { container } = imageDropzone({ disabled: shouldDisableDropzone });

  const onDrop: DropzoneProps["onDrop"] = useCallback(
    (acceptedFiles: File[]) => {
      setSelectedImages(
        acceptedFiles.map((f) => ({ file: f, status: "pending" })),
      );

      if (acceptedFiles.some((f) => f.type !== "image/jpeg")) {
        setNeedsCompression(true);
      }
    },
    [setNeedsCompression, setSelectedImages],
  );

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    onDrop,
    disabled: shouldDisableDropzone,
  });

  useEffect(() => {
    return () => {
      setSelectedImages([]);
      setNeedsCompression(false);
    };
  }, [setSelectedImages, setNeedsCompression]);

  return (
    <section {...getRootProps({ className: container() })}>
      <input {...getInputProps()} disabled={acceptedFiles.length !== 0} />
      {selectedImages.length === 0 && <ImageSelection compact={compact} />}
      {selectedImages.length > 0 && <ImageShowcase />}
    </section>
  );
};
