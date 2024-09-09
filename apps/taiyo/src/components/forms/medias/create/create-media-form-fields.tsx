import { MediaFormCoverCategory } from "~/components/forms/medias/categories/media-form-cover-category"
import { SubmitButton } from "~/components/generics/buttons/submit-button"
import { Form } from "~/components/generics/form/form"
import { InputField } from "~/components/generics/form/input-field"
import { TextAreaField } from "~/components/generics/form/textarea-field"
import { MediaFormDetailsCategory } from "../categories/media-form-details-category"
import { MediaFormTrackersCategory } from "../categories/media-form-trackers-category"

export const CreateMediaFormFields = () => (
  <Form.Layout>
    <Form.Category>
      <InputField
        name="mainTitle"
        label="Título"
        placeholder="Shingeki no Kyojin"
        isRequired
      />
      <TextAreaField
        name="synopsis"
        label="Sinopse"
        placeholder='Gol D. Roger, a man referred to as the "Pirate King," is set to be executed by the World Government. But just before his...'
        isRequired
      />
    </Form.Category>
    <MediaFormTrackersCategory />
    <MediaFormDetailsCategory />
    <MediaFormCoverCategory />
    <Form.Actions>
      <SubmitButton>Salvar</SubmitButton>
    </Form.Actions>
  </Form.Layout>
)
