import { Languages } from "@taiyomoe/db"
import { MediaFormCoverCategory } from "~/components/forms/medias/categories/media-form-cover-category"
import { SubmitButton } from "~/components/generics/buttons/submit-button"
import { Form } from "~/components/generics/form/form"
import { InputField } from "~/components/generics/form/input-field"
import { SelectField } from "~/components/generics/form/select-field"
import { MediaFormDetailsCategory } from "../categories/media-form-details-category"
import { MediaFormTrackersCategory } from "../categories/media-form-trackers-category"

export const CreateMediaFormFields = () => (
  <Form.Layout>
    <Form.Category title="Título">
      <Form.Row>
        <InputField
          name="mainTitle"
          label="Título"
          placeholder="Shingeki no Kyojin"
          labelPlacement="outside"
          isRequired
        />
        <SelectField
          name="mainTitleLanguage"
          className="md:w-1/4"
          label="Idioma"
          items={Languages}
          isRequired
        />
      </Form.Row>
    </Form.Category>
    <MediaFormTrackersCategory />
    <MediaFormDetailsCategory />
    <MediaFormCoverCategory />
    <Form.Actions>
      <SubmitButton>Salvar</SubmitButton>
    </Form.Actions>
  </Form.Layout>
)
