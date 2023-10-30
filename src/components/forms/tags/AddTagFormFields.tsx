"use client";

import { Button } from "@nextui-org/button";
import { useFormikContext } from "formik";

import { Form } from "~/components/generics/form/Form";
import { InputFormField } from "~/components/generics/form/InputFormField";
import { SwitchFormField } from "~/components/generics/form/SwitchFormField";
import { TextAreaFormField } from "~/components/generics/form/TextAreaFormField";

export const AddTagFormFields = () => {
  const { isSubmitting, isValid, dirty } = useFormikContext();

  const shouldDisableButton = isSubmitting || !(isValid && dirty);

  return (
    <Form.Layout>
      <Form.Category>
        <InputFormField name="name" label="Nome" />
        <TextAreaFormField
          name="description"
          label="Descrição"
          labelPlacement="outside"
          placeholder="Detalhes sobre a tag"
        />
      </Form.Category>
      <Form.Category title="Detalhes">
        <Form.Row>
          <InputFormField
            name="category"
            label="Categoria"
            labelPlacement="outside"
            placeholder="Sports"
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
        </Form.Row>
      </Form.Category>
      <Form.Actions>
        <Button
          color="primary"
          type="submit"
          className="w-fit font-medium"
          isDisabled={shouldDisableButton}
          isLoading={isSubmitting}
        >
          Adicionar
        </Button>
      </Form.Actions>
    </Form.Layout>
  );
};
