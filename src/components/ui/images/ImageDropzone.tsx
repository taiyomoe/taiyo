import { useCallback } from "react";
import { tv } from "@nextui-org/react";
import { useAtom } from "jotai";
import { useDropzone, type DropzoneProps } from "react-dropzone";

import { selectedImagesAtom } from "~/atoms/imageCompression.atoms";
import { ImageSelection } from "./ImageSelection";
import { ImageShowcase } from "./ImageShowcase";

const imageDropzone = tv({
  slots: {
    container: "flex w-full flex-col",
    label: "pb-[6px] text-small font-medium",
    contentWrapper:
      "min-h-unit-24 w-full rounded-medium border border-dashed border-default-300 bg-default-100 p-3",
  },
  variants: {
    disabled: {
      false: {
        container: "hover:cursor-pointer",
      },
    },
  },
});

export const ImageDropzone = () => {
  const [selectedImages, setSelectedImages] = useAtom(selectedImagesAtom);

  const shouldDisableDropzone = selectedImages.length !== 0;
  const { container, label, contentWrapper } = imageDropzone({
    disabled: shouldDisableDropzone,
  });

  const onDrop: DropzoneProps["onDrop"] = useCallback(
    (acceptedFiles: File[]) => {
      console.log("acceptedFiles", acceptedFiles);

      setSelectedImages(
        acceptedFiles.map((f) => ({ file: f, status: "pending" })),
      );
    },
    [setSelectedImages],
  );

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    onDrop,
    disabled: shouldDisableDropzone,
  });

  return (
    <section className={container()}>
      <p className={label()}>Imagens</p>
      <div {...getRootProps({ className: contentWrapper() })}>
        <input {...getInputProps()} disabled={acceptedFiles.length !== 0} />
        {acceptedFiles.length === 0 && <ImageSelection />}
        {acceptedFiles.length > 0 && <ImageShowcase />}
      </div>
    </section>
  );
};
