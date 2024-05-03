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
              <Form.Row className="flex-row flex-wrap items-end md:flex-nowrap">
                <InputField
                  name={`volumes.${i}.number`}
                  label="Volume"
                  labelPlacement="outside"
                  placeholder="3"
                  className="order-1 w-[calc(100%-3.5rem)] md:w-[100px] md:min-w-[100px]"
                />
                <RangeField
                  name={`volumes.${i}.ids`}
                  className="order-3 md:order-2"
                  matcher={handleMatch}
                  availableNumbers={availableNumbers}
                />
                <FormDeleteButton
                  name="volumes"
                  className="order-2 mb-1 md:order-3"
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
