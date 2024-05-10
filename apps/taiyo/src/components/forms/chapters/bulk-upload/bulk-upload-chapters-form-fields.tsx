import { SubmitButton } from "~/components/generics/buttons/new-submit-button"
import { InputField } from "~/components/generics/newForm/input-field"
import { MediasField } from "~/components/generics/newForm/medias-field"
import { Form } from "~/components/generics/newForm/new-form"
import { BulkUploadChaptersImagesCategory } from "./categories/bulk-upload-chapters-images-category"
import { BulkUploadChaptersLegendCategory } from "./categories/bulk-upload-chapters-legend-category"

export const BulkUploadChaptersFormFields = () => {
  return (
    <Form.Layout>
      <Form.Category>
        <MediasField />
        <InputField name="concurrent" label="Limite" type="number" />
      </Form.Category>
      <BulkUploadChaptersImagesCategory />
      <BulkUploadChaptersLegendCategory />
      <Form.Actions>
        <SubmitButton>Salvar</SubmitButton>
      </Form.Actions>
    </Form.Layout>
  )
}
