import { useCallback, useState } from "react";
import { tv } from "@nextui-org/react";
import { useDropzone, type DropzoneProps } from "react-dropzone";

import { ImageSelection } from "./ImageSelection";
import { ImageShowcase } from "./ImageShowcase";

const imageDropzone = tv({
  slots: {
    container: "flex w-full flex-col hover:cursor-pointer",
    label: "pb-[6px] text-small font-medium",
    contentWrapper:
      "min-h-unit-24 w-full rounded-medium border border-dashed border-default-300 bg-default-100 p-3",
  },
});

export const ImageDropzone = () => {
  const { container, label, contentWrapper } = imageDropzone();
  const [shouldDisable, setShouldDisable] = useState(false);

  const onDrop: DropzoneProps["onDrop"] = useCallback(
    (acceptedFiles: File[]) => {
      console.log(acceptedFiles);
      setShouldDisable(true);
    },
    [],
  );

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    onDrop,
    disabled: shouldDisable,
  });

  return (
    <section className={container()}>
      <p className={label()}>Imagens</p>
      <div {...getRootProps({ className: contentWrapper() })}>
        <input {...getInputProps()} disabled={acceptedFiles.length !== 0} />
        {acceptedFiles.length === 0 && <ImageSelection />}
        {acceptedFiles.length > 0 && <ImageShowcase images={acceptedFiles} />}
      </div>
    </section>
  );
};
