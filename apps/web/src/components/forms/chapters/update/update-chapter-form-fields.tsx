import { ContentRating, Flag, Languages } from "@taiyomoe/db"
import { SubmitButton } from "~/components/generics/buttons/submit-button"
import { Form } from "~/components/generics/form/form"
import { InputField } from "~/components/generics/form/input-field"
import { ScansField } from "~/components/generics/form/scans-field"
import { SelectField } from "~/components/generics/form/select-field"
import type { SelectItem } from "~/lib/types"

type Props = {
  scans: SelectItem[]
}

export const UpdateChapterFormFields = ({ scans }: Props) => (
  <Form.Layout>
    <Form.Category>
      <InputField name="id" label="ID" isDisabled />
      <InputField name="title" label="Título" />
      <ScansField name="scanIds" defaultValue={scans} />
    </Form.Category>
    <Form.Category title="Detalhes">
      <Form.Row>
        <InputField
          name="number"
          label="Número"
          labelPlacement="outside"
          placeholder="Ex: 1"
          type="number"
        />
        <InputField
          name="volume"
          label="Volume"
          labelPlacement="outside"
          placeholder="Ex: 1"
          type="number"
        />
      </Form.Row>
      <Form.Row>
        <SelectField
          name="contentRating"
          label="Classificação do conteúdo"
          items={ContentRating}
          isDisabled
        />
        <SelectField name="flag" label="Flag" items={Flag} isDisabled />
        <SelectField
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
