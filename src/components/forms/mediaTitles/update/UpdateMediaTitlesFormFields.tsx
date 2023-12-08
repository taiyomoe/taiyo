import { Tooltip } from "@nextui-org/tooltip";
import { Languages } from "@prisma/client";
import { useFormikContext } from "formik";

import { Form } from "~/components/generics/form/Form";
import { InputFormField } from "~/components/generics/form/InputFormField";
import { SelectFormField } from "~/components/generics/form/SelectFormField";
import { SwitchFormField } from "~/components/generics/form/SwitchFormField";
import type { UpdateMediaTitleSchema } from "~/lib/schemas";

export const UpdateMediaTitlesFormFields = () => {
  const { initialValues } = useFormikContext<UpdateMediaTitleSchema>();

  return (
    <Form.Col>
      <InputFormField
        name="title"
        label="Título"
        labelPlacement="outside"
        variant="faded"
      />
      <Form.Row>
        <SelectFormField
          name="language"
          label="Idioma"
          labelPlacement="outside"
          variant="faded"
          items={Languages}
        />
        <Tooltip
          content="Para trocar de título principal, em vez de desativar esta opção aqui, ative-a no novo título."
          isDisabled={initialValues.isMainTitle === false}
          color="warning"
        >
          <div className="min-w-fit">
            <SwitchFormField
              name="isMainTitle"
              label="Título principal"
              labelPlacement="outside"
              isDisabled={initialValues.isMainTitle}
            />
          </div>
        </Tooltip>
      </Form.Row>
      <Form.Row>
        <InputFormField
          name="priority"
          label="Prioridade"
          type="number"
          labelPlacement="outside"
          variant="faded"
        />
        <SwitchFormField
          name="isAcronym"
          label="Acrônimo"
          labelPlacement="outside"
        />
      </Form.Row>
    </Form.Col>
  );
};
