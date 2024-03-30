import { MediaFormTitlesCategory } from "~/components/forms/medias/categories/media-form-titles-category"
import { SubmitButton } from "~/components/generics/buttons/new-submit-button"
import { InputField } from "~/components/generics/newForm/input-field"
import { Form } from "~/components/generics/newForm/new-form"
import { TextAreaField } from "~/components/generics/newForm/textarea-field"
import { MediaFormDetailsCategory } from "./categories/media-form-details-category"
import { MediaFormTrackersCategory } from "./categories/media-form-trackers-category"

type Props = {
  action: "create" | "update"
}

export const MediaFormFields = ({ action }: Props) => {
  const buttonText = action === "create" ? "Adicionar" : "Salvar"

  return (
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
      {action === "create" && <MediaFormTitlesCategory />}
      <Form.Actions>
        <SubmitButton>{buttonText}</SubmitButton>
      </Form.Actions>
    </Form.Layout>
  )
}
