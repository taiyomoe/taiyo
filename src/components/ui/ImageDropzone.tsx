import { useCallback } from "react";
import { tv } from "@nextui-org/react";
import { useDropzone, type DropzoneProps } from "react-dropzone";

const imageDropzone = tv({
  slots: {
    container: "flex w-full flex-col",
    label: "pb-[6px] text-small font-medium",
    contentWrapper:
      "min-h-unit-24 w-full rounded-medium border border-dashed border-default-300 bg-default-100 p-3",
  },
});

export const ImageDropzone = () => {
  const { container, label, contentWrapper } = imageDropzone();

  const onDrop: DropzoneProps["onDrop"] = useCallback(
    (acceptedFiles: File[]) => {
      console.log(acceptedFiles);
    },
    [],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <section className={container()}>
      <p className={label()}>Imagens</p>
      <div {...getRootProps({ className: contentWrapper() })}>
        <input {...getInputProps()} />
        {!isDragActive && <p>Drop some files here ...</p>}
      </div>
    </section>
  );
};
