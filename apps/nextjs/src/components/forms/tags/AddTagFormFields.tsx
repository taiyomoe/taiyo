"use client";

import { Button } from "@nextui-org/button";
import { useFormikContext } from "formik";

import { InputFormField } from "~/components/generics/form/InputFormField";
import { SwitchFormField } from "~/components/generics/form/SwitchFormField";
import { TextAreaFormField } from "~/components/generics/form/TextAreaFormField";

export const AddTagFormFields = () => {
  const { isSubmitting, isValid, dirty } = useFormikContext();

  const shouldDisableButton = isSubmitting || !(isValid && dirty);

  return (
    <div className="flex flex-col items-end gap-8">
      <div className="flex w-full flex-col gap-6">
        <InputFormField name="name" label="Nome" />
        <TextAreaFormField
          name="description"
          label="Descrição"
          labelPlacement="outside"
          placeholder="Detalhes sobre a tag"
        />
        <div className="flex flex-col gap-6 sm:flex-row">
          <InputFormField
            name="category"
            label="Categoria"
            labelPlacement="outside"
            placeholder="Sports"
            className="w-full"
          />
          <div className="flex gap-6">
            <InputFormField
              name="alId"
              label="ID do AniList"
              type="number"
              labelPlacement="outside"
              placeholder="Ex: 1234"
              className="w-full min-w-[100px] sm:w-fit"
            />
            <SwitchFormField
              name="isAdult"
              label="Adulto"
              labelPlacement="outside"
              size="lg"
            />
          </div>
        </div>
      </div>
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
