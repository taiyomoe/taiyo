import { Languages } from "@prisma/client";

import { Form } from "~/components/generics/form/Form";
import { InputFormField } from "~/components/generics/form/InputFormField";
import { SelectFormField } from "~/components/generics/form/SelectFormField";
import { SwitchFormField } from "~/components/generics/form/SwitchFormField";

type Props = {
  action: "create" | "update";
  index?: number;
};

export const UpdateMediaTitlesFormFields = ({ action, index }: Props) => {
  const getFieldName = (name: string) => {
    if (action === "create") {
      return `titles[${index}].${name}`;
    }

    return name;
  };

  return (
    <Form.Col>
      <InputFormField
        name={getFieldName("title")}
        label="Título"
        labelPlacement="outside"
        variant="faded"
      />
      <Form.Row>
        <SelectFormField
          name={getFieldName("language")}
          label="Idioma"
          labelPlacement="outside"
          variant="faded"
          items={Languages}
        />
        <SwitchFormField
          name={getFieldName("isMainTitle")}
          label="Título principal"
          labelPlacement="outside"
        />
      </Form.Row>
      <Form.Row>
        <InputFormField
          name={getFieldName("priority")}
          label="Prioridade"
          type="number"
          labelPlacement="outside"
          variant="faded"
        />
        <SwitchFormField
          name={getFieldName("isAcronym")}
          label="Acrônimo"
          labelPlacement="outside"
        />
      </Form.Row>
    </Form.Col>
  );
};
