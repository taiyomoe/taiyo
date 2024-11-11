import { useSetAtom } from "jotai"
import { useFormContext } from "react-hook-form"
import { bulkUploadChaptersStateAtoms } from "~/atoms/bulkUploadChapters.atoms"
import { ResetButton } from "~/components/generics/buttons/reset-button"
import { SubmitButton } from "~/components/generics/buttons/submit-button"
import { Form } from "~/components/generics/form/form"
import { InputField } from "~/components/generics/form/input-field"
import { MediasField } from "~/components/generics/form/medias-field"
import { BulkUploadChaptersImagesCategory } from "./categories/bulk-upload-chapters-images-category"
import { BulkUploadChaptersLegendCategory } from "./categories/bulk-upload-chapters-legend-category"

export const BulkUploadChaptersFormFields = () => {
  const setChaptersState = useSetAtom(bulkUploadChaptersStateAtoms)
  const { reset } = useFormContext()

  const handleReset = () => {
    setChaptersState({})

    /** Shouldn't have to do this manually, but seems like reset() is not working */
    reset({ chapters: [], mediaId: "" })
  }

  return (
    <Form.Layout>
      <Form.Category>
        <MediasField name="mediaId" isRequired />
        <InputField name="concurrent" label="Limite" type="number" />
      </Form.Category>
      <BulkUploadChaptersImagesCategory />
      <BulkUploadChaptersLegendCategory />
      <Form.Actions>
        <ResetButton onPress={handleReset}>Resetar</ResetButton>
        <SubmitButton>Salvar</SubmitButton>
      </Form.Actions>
    </Form.Layout>
  )
}
