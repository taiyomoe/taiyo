"use client";

import { Button } from "@nextui-org/button";
import { useFormikContext } from "formik";

import { InputFormField } from "~/components/generics/form/InputFormField";
import { TextAreaFormField } from "~/components/generics/form/TextAreaFormField";

export const AddScanFormFields = () => {
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
        <div className="flex gap-6 md:flex-row">
          <InputFormField
            name="website"
            label="Website"
            labelPlacement="outside"
            placeholder="Sports"
            className="w-full"
          />
          <InputFormField
            name="discord"
            label="Discord"
            labelPlacement="outside"
            placeholder="Sports"
            className="w-full"
          />
        </div>
        <div className="flex gap-6 md:flex-row">
          <InputFormField
            name="twitter"
            label="Twitter"
            labelPlacement="outside"
            placeholder="Sports"
            className="w-full"
          />
          <InputFormField
            name="facebook"
            label="Facebook"
            labelPlacement="outside"
            placeholder="Sports"
            className="w-full"
          />
        </div>
        <div className="flex gap-6 md:flex-row">
          <InputFormField
            name="instagram"
            label="Instagram"
            labelPlacement="outside"
            placeholder="Sports"
            className="w-full"
          />
          <InputFormField
            name="Telegram"
            label="Telegram"
            labelPlacement="outside"
            placeholder="Sports"
            className="w-full"
          />
        </div>
        <div className="flex gap-6 md:flex-row">
          <InputFormField
            name="youtube"
            label="YouTube"
            labelPlacement="outside"
            placeholder="Sports"
            className="w-full"
          />
          <InputFormField
            name="email"
            label="Email"
            labelPlacement="outside"
            placeholder="Sports"
            className="w-full"
          />
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
