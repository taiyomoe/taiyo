import { Tooltip } from "@nextui-org/tooltip"
import { Languages } from "@prisma/client"

import type {
  CreateMediaTitleSchema,
  UpdateMediaTitleSchema,
} from "@taiyomoe/schemas"
import { Form } from "~/components/generics/form/Form"
import { InputFormField } from "~/components/generics/form/InputFormField"
import { SelectFormField } from "~/components/generics/form/SelectFormField"
import { SwitchFormField } from "~/components/generics/form/SwitchFormField"

type Props = {
  initialValues: CreateMediaTitleSchema | UpdateMediaTitleSchema
  mode?: "standalone" | "array"
  index?: number
}

export const MediaTitlesFormFields = (props: Props) => {
  const { initialValues, mode, index } = props

  const getFieldName = (name: string) => {
    if (mode === "array") {
      return `titles[${index}].${name}`
    }

    return name
  }

  return (
    <Form.Col>
      <InputFormField
        name={getFieldName("title")}
        label="Título"
        labelPlacement="outside"
        placeholder="Shingeki no Kyojin"
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
        <Tooltip
          content="Para trocar de título principal, em vez de desativar esta opção aqui, ative-a no novo título."
          isDisabled={initialValues.isMainTitle === false}
          color="warning"
        >
          <div className="min-w-fit">
            <SwitchFormField
              name={getFieldName("isMainTitle")}
              label="Título principal"
              labelPlacement="outside"
              isDisabled={initialValues.isMainTitle}
            />
          </div>
        </Tooltip>
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
  )
}
