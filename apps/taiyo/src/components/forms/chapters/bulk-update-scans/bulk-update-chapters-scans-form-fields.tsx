import { Divider } from "@nextui-org/divider"
import type { BulkUpdateChaptersScansSchema } from "@taiyomoe/schemas"
import type { MediaChapterWithScans } from "@taiyomoe/types"
import { Fragment, useMemo } from "react"
import { useFieldArray } from "react-hook-form"
import { FormAddButton } from "~/components/generics/buttons/form-add-button"
import { FormDeleteButton } from "~/components/generics/buttons/form-delete-button"
import { SubmitButton } from "~/components/generics/buttons/submit-button"
import { Form } from "~/components/generics/form/form"
import { RangeField } from "~/components/generics/form/range-field"
import { ScansField } from "~/components/generics/form/scans-field"
import type { RangeItem } from "~/lib/types"

type Props = {
  chapters: MediaChapterWithScans[]
}

export const BulkUpdateChaptersScansFormFields = ({ chapters }: Props) => {
  const { fields, append, remove } =
    useFieldArray<BulkUpdateChaptersScansSchema>({
      name: "scans",
    })
  const availableItems = useMemo(() => {
    const uniqueItems: RangeItem[] = []

    for (const chapter of chapters) {
      if (uniqueItems.find((i) => i.value === chapter.id)) continue

      uniqueItems.push({
        label: chapter.number,
        value: chapter.id,
      })
    }

    return uniqueItems
  }, [chapters])

  return (
    <Form.Layout>
      <Form.Category
        title="Scans"
        actions={
          <FormAddButton onPress={() => append({ scanIds: [], ids: [] })} />
        }
      >
        <Form.Col>
          {fields.map((_, i) => (
            <Fragment key={_.id}>
              <Form.Row className="flex-row flex-wrap md:flex-nowrap">
                <ScansField
                  name={`scans.${i}.scanIds`}
                  className="min-w-full md:min-w-2/4"
                />
                <RangeField
                  name={`scans.${i}.ids`}
                  className="w-[calc(100%-3.5rem)] md:mt-[26px] md:min-w-[calc(50%-5rem)]"
                  items={availableItems}
                />
                <FormDeleteButton
                  name="scans"
                  className="self-center md:mt-[30px] md:self-auto"
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
