import { SubmitButton } from "~/components/generics/buttons/submit-button"
import { InputField } from "~/components/generics/form/input-field"
import { MediasField } from "~/components/generics/form/medias-field"
import { Form } from "~/components/generics/form/new-form"
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
