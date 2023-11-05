import { useCallback, useEffect } from "react";
import { tv } from "@nextui-org/react";
import type { UploadSessionType } from "@prisma/client";
import { useAtom, useSetAtom } from "jotai";
import { useDropzone } from "react-dropzone";
import type { DropzoneProps } from "react-dropzone";

import {
  needsCompressionAtom,
  selectedImagesAtom,
} from "~/atoms/imageCompression.atoms";
import type { SelectedImage } from "~/lib/types";

import { ImageSelection } from "./ImageSelection";
import { ImageShowcase } from "./ImageShowcase";

type Props = {
  type: UploadSessionType;
  isCompact?: boolean;
};

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

export const ImageDropzone = ({ type, isCompact }: Props) => {
  const [selectedImagesAtomValue, setSelectedImages] =
    useAtom(selectedImagesAtom);
  const setNeedsCompression = useSetAtom(needsCompressionAtom);
  const selectedImages = selectedImagesAtomValue.filter((x) => x.type === type);

  const shouldDisableDropzone = selectedImages.length !== 0;
  const { container } = imageDropzone({ disabled: shouldDisableDropzone });

  const onDrop: DropzoneProps["onDrop"] = useCallback(
    (acceptedFiles: File[]) => {
      setSelectedImages(
        (prev) =>
          [
            ...prev,
            ...acceptedFiles.map((f) => ({ type, file: f, status: "pending" })),
          ] as SelectedImage[],
      );

      if (acceptedFiles.some((f) => f.type !== "image/jpeg")) {
        setNeedsCompression(true);
      }
    },
    [setNeedsCompression, setSelectedImages, type],
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
      {selectedImages.length === 0 && <ImageSelection isCompact={isCompact} />}
      {selectedImages.length > 0 && <ImageShowcase type={type} />}
    </section>
  );
};
