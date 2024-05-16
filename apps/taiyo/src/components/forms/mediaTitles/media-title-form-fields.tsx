import { Tooltip } from "@nextui-org/tooltip"
import { Languages } from "@prisma/client"
import type { UpdateMediaTitleInput } from "@taiyomoe/schemas"
import { useFormState } from "react-hook-form"
import { InputField } from "~/components/generics/form/input-field"
import { Form } from "~/components/generics/form/new-form"
import { SelectField } from "~/components/generics/form/select-field"
import { SwitchField } from "~/components/generics/form/switch-field"

export const MediaTitleFormFields = () => {
  const { defaultValues } = useFormState<UpdateMediaTitleInput>()

  return (
    <Form.Col>
      <InputField
        name="title"
        label="Título"
        labelPlacement="outside"
        placeholder="Shingeki no Kyojin"
        variant="faded"
      />
      <Form.Row>
        <SelectField
          name="language"
          label="Idioma"
          labelPlacement="outside"
          variant="faded"
          items={Languages}
        />
        <Tooltip
          content="Para trocar de título principal, em vez de desativar esta opção aqui, ative-a no novo título."
          isDisabled={!defaultValues?.isMainTitle}
          color="warning"
        >
          <div className="min-w-fit">
            <SwitchField
              name="isMainTitle"
              label="Título principal"
              labelPlacement="outside"
              isDisabled={defaultValues?.isMainTitle}
            />
          </div>
        </Tooltip>
      </Form.Row>
      <Form.Row>
        <InputField
          name="priority"
          label="Prioridade"
          type="number"
          labelPlacement="outside"
          variant="faded"
        />
        <SwitchField
          name="isAcronym"
          label="Acrônimo"
          labelPlacement="outside"
        />
      </Form.Row>
    </Form.Col>
  )
}
