"use client";

import { useCallback, useState } from "react";
import { Button } from "@nextui-org/button";
import { useFormikContext } from "formik";
import { useAtom } from "jotai";
import { toast } from "sonner";

import { selectedImagesAtom } from "~/atoms/imageCompression.atoms";
import { InputFormField } from "~/components/generics/form/InputFormField";
import { ImageDropzone } from "~/components/ui/images/ImageDropzone";
import { ImageUtils } from "~/lib/utils/image.utils";

export const UploadChapterFormFields = () => {
  const { isSubmitting, isValid, dirty } = useFormikContext();
  const [selectedImages, setSelectedImages] = useAtom(selectedImagesAtom);
  const [compressed, setCompressed] = useState(false);

  const shouldDisableButton = isSubmitting || !(isValid && dirty);

  const handleCompressImages = useCallback(() => {
    setCompressed((prev) => !prev);

    const promise = () =>
      Promise.all(
        selectedImages.map(async (img) => {
          setSelectedImages((prev) =>
            prev.map((i) =>
              i.file.name === img.file.name
                ? { file: img.file, status: "compressing" }
                : i,
            ),
          );

          const result = await ImageUtils.compress(img.file);

          setSelectedImages((prev) =>
            prev.map((i) =>
              i.file.name === img.file.name
                ? { file: result, status: "compressed" }
                : i,
            ),
          );
        }),
      );

    toast.promise(promise, {
      loading: "Compressing images...",
      success: "Images compressed!",
      error: "Error while compressing images",
    });
  }, [selectedImages, setSelectedImages]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex w-full flex-col gap-6">
        <InputFormField name="id" label="ID do capítulo" isDisabled />
        <InputFormField name="mediaId" label="ID da obra" />
        <InputFormField name="title" label="Título" />
        <div className="flex w-full gap-6">
          <InputFormField
            name="number"
            label="Número"
            labelPlacement="outside"
            placeholder="Ex: 1"
            className="w-full"
          />
          <InputFormField
            name="volume"
            label="Volume"
            labelPlacement="outside"
            placeholder="Ex: 1"
            className="w-full"
          />
        </div>
      </div>
      <ImageDropzone />
      <div className="flex justify-end gap-6">
        <Button
          className="w-fit font-medium"
          variant="flat"
          onClick={handleCompressImages}
          isDisabled={compressed}
        >
          Comprimir
        </Button>
        <Button
          color="primary"
          type="submit"
          className="w-fit font-medium"
          isDisabled={shouldDisableButton}
          isLoading={isSubmitting}
        >
          Adicionar
        </Button>
      </div>
    </div>
  );
};
