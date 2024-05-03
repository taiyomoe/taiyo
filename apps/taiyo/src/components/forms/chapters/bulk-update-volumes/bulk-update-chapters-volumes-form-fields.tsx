import { Divider } from "@nextui-org/divider"
import type { MediaChapter } from "@prisma/client"
import type { BulkUpdateChaptersVolumesSchema } from "@taiyomoe/schemas"
import { max, sort } from "radash"
import { Fragment, useCallback, useMemo } from "react"
import { useFieldArray } from "react-hook-form"
import { FormAddButton } from "~/components/generics/buttons/FormAddButton"
import { FormDeleteButton } from "~/components/generics/buttons/FormDeleteButton"
import { SubmitButton } from "~/components/generics/buttons/new-submit-button"
import { InputField } from "~/components/generics/newForm/input-field"
import { Form } from "~/components/generics/newForm/new-form"
import { RangeField } from "~/components/generics/newForm/range-field"

type Props = {
  chapters: MediaChapter[]
}

export const BulkUpdateChaptersVolumesFormFields = ({ chapters }: Props) => {
  const { fields, append, remove } =
    useFieldArray<BulkUpdateChaptersVolumesSchema>({
      name: "volumes",
    })
  const availableNumbers = useMemo(
    () => [...new Set(chapters.map((c) => c.number))],
    [chapters],
  )

  const handleAdd = useCallback(() => {
    const highestNumber = max(fields, (f) => f.number ?? -1)!.number ?? 0

    append({ number: highestNumber + 1, ids: [] })
  }, [append, fields])

  const handleMatch = useCallback(
    (value: number) => {
      const chapter = chapters.find((c) => c.number === value)

      return chapter?.id
    },
    [chapters.find],
  )

  return (
    <Form.Layout>
      <Form.Category
        title="Volumes"
        actions={<FormAddButton onPress={handleAdd} />}
      >
        <Form.Col>
          {sort(fields, (f) => f.number ?? -1).map((_, i) => (
            <Fragment key={_.number}>
              <Form.Row className="items-end">
                <InputField
                  name={`volumes.${i}.number`}
                  label="Volume"
                  labelPlacement="outside"
                  placeholder="3"
                  className="w-[100px] min-w-[100px]"
                />
                <RangeField
                  name={`volumes.${i}.ids`}
                  matcher={handleMatch}
                  availableNumbers={availableNumbers}
                />
                <FormDeleteButton
                  name="volumes"
                  className="mb-1"
                  onPress={() => remove(i)}
                />
              </Form.Row>
              {i < fields.length - 1 && <Divider />}
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
