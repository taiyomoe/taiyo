"use client";

import { Button } from "@nextui-org/button";
import { useFormikContext } from "formik";

import { InputFormField } from "~/components/generics/form/InputFormField";
import { ImageDropzone } from "~/components/ui/ImageDropzone";

export const UploadChapterFormFields = () => {
  const { isSubmitting, isValid, dirty } = useFormikContext();

  const shouldDisableButton = isSubmitting || !(isValid && dirty);

  return (
    <div className="flex flex-col items-end gap-8">
      <div className="flex w-full flex-col gap-6">
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
  );
};
