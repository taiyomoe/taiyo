import { useCallback, useEffect } from "react";
import { Button } from "@nextui-org/button";
import { Card, CardBody } from "@nextui-org/card";
import { tv } from "@nextui-org/react";
import type { UploadSessionType } from "@prisma/client";
import { useAtom, useSetAtom } from "jotai";
import type { DropzoneProps } from "react-dropzone";
import { useDropzone } from "react-dropzone";

import {
  needsCompressionAtom,
  selectedImagesAtom,
} from "~/atoms/imageCompression.atoms";
import type { SelectedImage } from "~/lib/types";

import { ImageSelection } from "./ImageSelection";

type Props = {
  title: string;
  type: UploadSessionType;
  isCompact?: boolean;
  onDrop: () => void;
  children(options: { selectedImages: SelectedImage[] }): React.ReactNode;
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

export const NewImageDropzone = (props: Props) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { title, type, isCompact, onDrop, children } = props;
  const [selectedImagesAtomValue, setSelectedImages] =
    useAtom(selectedImagesAtom);
  const setNeedsCompression = useSetAtom(needsCompressionAtom);
  const selectedImages = selectedImagesAtomValue.filter((x) => x.type === type);

  const shouldDisableUploadButton = selectedImages.length === 0;
  const shouldDisableClick = selectedImages.length !== 0;

  const { container } = imageDropzone({ disabled: shouldDisableClick });

  const handleDrop: DropzoneProps["onDrop"] = useCallback(
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

      onDrop();
    },
    [onDrop, setNeedsCompression, setSelectedImages, type],
  );

  const { getRootProps, getInputProps, acceptedFiles, open } = useDropzone({
    onDrop: handleDrop,
    maxFiles: Infinity,
    noClick: shouldDisableClick,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    validator: (file) => {
      if (selectedImages.some((x) => x.file.size === file.size)) {
        return {
          code: "file-already-selected",
          message: `O arquivo ${file.name} já foi selecionado.`,
        };
      }

      return null;
    },
  });

  useEffect(() => {
    return () => {
      setSelectedImages([]);
      setNeedsCompression(false);
    };
  }, [setSelectedImages, setNeedsCompression]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <h3 className="line-clamp-1 text-2xl font-medium">{title}</h3>
        <div className="flex gap-2">
          <Button className="font-medium" onClick={open} color="primary">
            Selecionar
          </Button>
        </div>
      </div>
      <Card className="rounded-medium">
        <CardBody className="p-0">
          <section {...getRootProps({ className: container() })}>
            <input {...getInputProps()} disabled={acceptedFiles.length !== 0} />
            {selectedImages.length === 0 && (
              <ImageSelection isCompact={isCompact} />
            )}
            {selectedImages.length > 0 && children({ selectedImages })}
          </section>
        </CardBody>
      </Card>
      <div className="flex justify-end">
        <Button
          className="font-medium"
          color="primary"
          isDisabled={shouldDisableUploadButton}
          type="submit"
        >
          Upar
        </Button>
      </div>
    </div>
  );
};
