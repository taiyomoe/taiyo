import { useCallback } from "react";
import { Button } from "@nextui-org/button";
import { Card, CardBody } from "@nextui-org/card";
import { tv } from "@nextui-org/react";
import type { UploadSessionType } from "@prisma/client";
import type { DropzoneProps } from "react-dropzone";
import { useDropzone } from "react-dropzone";

import { SubmitButton } from "~/components/generics/buttons/SubmitButton";
import { Form } from "~/components/generics/form/Form";
import { useImageStore } from "~/stores";

import { ImageSelection } from "./ImageSelection";

type Props = {
  title: string;
  type: UploadSessionType;
  isCompact?: boolean;
  onDrop?: (filesLength: number) => void;
  children(options: { selectedImages: File[] }): React.ReactNode;
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
    compact: {
      true: {
        container:
          "max-h-[498px] overflow-y-auto scrollbar-track-content2 scrollbar-thumb-primary scrollbar-thin",
      },
    },
  },
});

export const ImageDropzone = (props: Props) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { title, type, isCompact, onDrop, children } = props;
  const { getImages, load } = useImageStore();
  const selectedImages = getImages(type);

  const shouldDisableUploadButton = selectedImages.length === 0;
  const shouldDisableClick = selectedImages.length !== 0;

  const { container } = imageDropzone({
    disabled: shouldDisableClick,
    compact: selectedImages.length !== 0 && isCompact,
  });

  const handleDrop: DropzoneProps["onDrop"] = useCallback(
    (acceptedFiles: File[]) => {
      void onDrop?.(acceptedFiles.length);
      void load(type, acceptedFiles);
    },
    [load, onDrop, type],
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
      if (selectedImages.some((f) => f.size === file.size)) {
        return {
          code: "file-already-selected",
          message: `O arquivo ${file.name} já foi selecionado.`,
        };
      }

      return null;
    },
  });

  return (
    <>
      <Form.Category
        title={title}
        actions={
          <Button className="font-medium" onClick={open} color="primary">
            Selecionar
          </Button>
        }
      >
        <Card className="h-full rounded-medium">
          <CardBody className="p-0">
            <section {...getRootProps({ className: container() })}>
              <input
                {...getInputProps()}
                disabled={acceptedFiles.length !== 0}
              />
              {selectedImages.length === 0 && <ImageSelection />}
              {selectedImages.length > 0 && children({ selectedImages })}
            </section>
          </CardBody>
        </Card>
      </Form.Category>
      <Form.Actions>
        <SubmitButton isDisabled={shouldDisableUploadButton}>Upar</SubmitButton>
      </Form.Actions>
    </>
  );
};
