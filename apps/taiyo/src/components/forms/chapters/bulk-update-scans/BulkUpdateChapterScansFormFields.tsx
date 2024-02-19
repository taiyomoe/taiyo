import { Divider } from "@nextui-org/divider"
import { BulkUpdateMediaChapterScansSchema } from "@taiyomoe/schemas"
import { MediaChapterWithScans } from "@taiyomoe/types"
import { useFormikContext } from "formik"
import { Fragment, useCallback } from "react"

import { FormAddButton } from "~/components/generics/buttons/FormAddButton"
import { FormDeleteButton } from "~/components/generics/buttons/FormDeleteButton"
import { SubmitButton } from "~/components/generics/buttons/SubmitButton"
import { Form } from "~/components/generics/form/Form"
import { RangeFormField } from "~/components/generics/inputs/RangeFormField"
import { ScansFormField } from "~/components/generics/inputs/ScansFormField"

type Props = {
  chapters: MediaChapterWithScans[]
}

export const BulkUpdateChapterScansFormFields = ({ chapters }: Props) => {
  const { values, setValues } =
    useFormikContext<BulkUpdateMediaChapterScansSchema>()

  const handleAdd = useCallback(() => {
    setValues((prev) => [...prev, { scanIds: [], ids: [] }])
  }, [setValues])

  const handleDelete = useCallback(
    (index: number) => () => {
      setValues((prev) => prev.filter((_, i) => i !== index))
    },
    [setValues],
  )

  return (
    <Form.Layout>
      <Form.Category
        title="Scans"
        actions={<FormAddButton onPress={handleAdd} />}
      >
        <Form.Col>
          {values.map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: we have nothing better to use as a key here
            <Fragment key={i}>
              <Form.Row className="items-start">
                <ScansFormField name={`[${i}].scanIds`} />
                <div className="w-full md:max-w-lg">
                  <RangeFormField name={`[${i}].ids`} chapters={chapters} />
                </div>
                <FormDeleteButton className="mt-7" onPress={handleDelete(i)} />
              </Form.Row>
              {i < values.length - 1 && <Divider />}
            </Fragment>
          ))}
        </Form.Col>
      </Form.Category>
      <Form.Actions>
        <SubmitButton>Salvar</SubmitButton>
      </Form.Actions>
    </Form.Layout>
  )
}
