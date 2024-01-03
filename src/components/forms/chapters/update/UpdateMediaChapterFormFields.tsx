import type { Scan } from "@prisma/client"
import { ContentRating, Flag, Languages } from "@prisma/client"

import { SubmitButton } from "~/components/generics/buttons/SubmitButton"
import { Form } from "~/components/generics/form/Form"
import { InputFormField } from "~/components/generics/form/InputFormField"
import { SelectFormField } from "~/components/generics/form/SelectFormField"
import { ScansFormField } from "~/components/generics/inputs/ScansFormField"

type Props = {
  scans: Scan[]
}

export const UpdateMediaChapterFormFields = ({ scans }: Props) => {
  return (
    <Form.Layout>
      <Form.Category>
        <InputFormField name="id" label="ID" isDisabled />
        <InputFormField name="title" label="Título" />
        <ScansFormField scans={scans} />
      </Form.Category>
      <Form.Category title="Detalhes">
        <Form.Row>
          <InputFormField
            name="number"
            label="Número"
            labelPlacement="outside"
            placeholder="Ex: 1"
            type="number"
          />
          <InputFormField
            name="volume"
            label="Volume"
            labelPlacement="outside"
            placeholder="Ex: 1"
            type="number"
          />
        </Form.Row>
        <Form.Row>
          <SelectFormField
            name="contentRating"
            label="Classificação do conteúdo"
            items={ContentRating}
            isDisabled
          />
          <SelectFormField name="flag" label="Flag" items={Flag} isDisabled />
          <SelectFormField
            name="language"
            label="Idioma"
            items={Languages}
            isDisabled
          />
        </Form.Row>
      </Form.Category>

      <Form.Actions>
        <SubmitButton>Salvar</SubmitButton>
      </Form.Actions>
    </Form.Layout>
  )
}
