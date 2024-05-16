import { ContentRating, Flag, Languages } from "@prisma/client"
import { ChapterFormImagesCategory } from "~/components/forms/chapters/upload/categories/chapter-form-images-category"
import { SubmitButton } from "~/components/generics/buttons/submit-button"
import { Form } from "~/components/generics/form/form"
import { InputField } from "~/components/generics/form/input-field"
import { MediasField } from "~/components/generics/form/medias-field"
import { ScansField } from "~/components/generics/form/scans-field"
import { SelectField } from "~/components/generics/form/select-field"

export const UploadChapterFormFields = () => {
  return (
    <Form.Layout>
      <Form.Category>
        <MediasField />
        <InputField name="title" label="Título" isRequired />
        <ScansField name="scanIds" />
      </Form.Category>
      <Form.Category title="Detalhes">
        <Form.Row>
          <InputField
            name="number"
            label="Número"
            labelPlacement="outside"
            placeholder="Ex: 1"
            type="number"
            className="chapter-number"
            isRequired
          />
          <InputField
            name="volume"
            label="Volume"
            labelPlacement="outside"
            placeholder="Ex: 1"
            type="number"
            className="chapter-volume"
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
      <ChapterFormImagesCategory />
      <Form.Actions>
        <SubmitButton>Salvar</SubmitButton>
      </Form.Actions>
    </Form.Layout>
  )
}
