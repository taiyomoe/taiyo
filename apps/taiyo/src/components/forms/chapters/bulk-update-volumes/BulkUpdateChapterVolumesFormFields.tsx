import { Divider } from "@nextui-org/divider"
import type { MediaChapter } from "@prisma/client"
import type { BulkUpdateMediaChapterVolumesSchema } from "@taiyomoe/schemas"
import { useFormikContext } from "formik"
import { Fragment, useCallback } from "react"
import { FormAddButton } from "~/components/generics/buttons/FormAddButton"
import { FormDeleteButton } from "~/components/generics/buttons/FormDeleteButton"
import { SubmitButton } from "~/components/generics/buttons/SubmitButton"
import { Form } from "~/components/generics/form/Form"
import { InputFormField } from "~/components/generics/form/InputFormField"
import { RangeFormField } from "~/components/generics/inputs/RangeFormField"

type Props = {
  chapters: MediaChapter[]
}

export const BulkUpdateChapterVolumesFormFields = ({ chapters }: Props) => {
  const { values, setValues } =
    useFormikContext<BulkUpdateMediaChapterVolumesSchema>()

  const handleAdd = useCallback(() => {
    const highestVolume = values.reduce(
      (acc, curr) => Math.max(acc, curr.volume),
      0,
    )

    setValues((prev) => [...prev, { volume: highestVolume + 1, ids: [] }])
  }, [values, setValues])

  const handleDelete = useCallback(
    (index: number) => () => {
      setValues((prev) => prev.filter((_, i) => i !== index))
    },
    [setValues],
  )

  return (
    <Form.Layout>
      <Form.Category
        title="Volumes"
        actions={<FormAddButton onPress={handleAdd} />}
      >
        <Form.Col>
          {values
            .sort((a, b) => a.volume - b.volume)
            .map((_, i) => (
              <Fragment key={_.volume}>
                <Form.Row className="items-start">
                  <InputFormField
                    name={`[${i}].volume`}
                    label="Volume"
                    labelPlacement="outside"
                    placeholder="3"
                    className="min-w-[100px] w-[100px]"
                  />
                  <RangeFormField name={`[${i}].ids`} chapters={chapters} />
                  <FormDeleteButton
                    className="mt-7"
                    onPress={handleDelete(i)}
                  />
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
