"use client";

import { Button } from "@nextui-org/button";
import { useFormikContext } from "formik";

import { InputFormField } from "~/components/generics/form/InputFormField";
import { ImageDropzone } from "~/components/ui/images/ImageDropzone";
import { useChapterImageCompression } from "~/hooks/useChapterImageCompression";

export const UploadChapterFormFields = () => {
  const { isSubmitting, isValid, dirty } = useFormikContext();
  const { needsCompression, handleCompressImages } =
    useChapterImageCompression();

  const shouldDisableButton =
    needsCompression || isSubmitting || !(isValid && dirty);

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
          isDisabled={!needsCompression}
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
