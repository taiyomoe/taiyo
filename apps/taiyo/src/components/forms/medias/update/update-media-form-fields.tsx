import { SubmitButton } from "~/components/generics/buttons/submit-button"
import { InputField } from "~/components/generics/form/input-field"
import { Form } from "~/components/generics/form/new-form"
import { TextAreaField } from "~/components/generics/form/textarea-field"
import { MediaFormDetailsCategory } from "../categories/media-form-details-category"
import { MediaFormTrackersCategory } from "../categories/media-form-trackers-category"

export const UpdateMediaFormFields = () => (
  <Form.Layout>
    <Form.Category>
      <InputField name="id" label="ID da obra" isDisabled />
      <TextAreaField
        name="synopsis"
        label="Sinopse"
        placeholder='Gol D. Roger, a man referred to as the "Pirate King," is set to be executed by the World Government. But just before his...'
      />
    </Form.Category>
    <MediaFormTrackersCategory />
    <MediaFormDetailsCategory />
    <Form.Actions>
      <SubmitButton>Salvar</SubmitButton>
    </Form.Actions>
  </Form.Layout>
)
