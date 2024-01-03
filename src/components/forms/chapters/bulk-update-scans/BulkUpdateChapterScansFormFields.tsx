import { Accordion, AccordionItem } from "@nextui-org/accordion"
import { Divider } from "@nextui-org/divider"
import { MediaChapter } from "@prisma/client"
import { useFormikContext } from "formik"
import { useCallback, useEffect } from "react"

import { FormAddButton } from "~/components/generics/buttons/FormAddButton"
import { FormDeleteButton } from "~/components/generics/buttons/FormDeleteButton"
import { SubmitButton } from "~/components/generics/buttons/SubmitButton"
import { Form } from "~/components/generics/form/Form"
import { RangeFormField } from "~/components/generics/inputs/RangeFormField"
import { ScansFormField } from "~/components/generics/inputs/ScansFormField"
import { BulkUpdateMediaChapterScansSchema } from "~/lib/schemas"

type Props = {
  chapters: MediaChapter[]
}

export const BulkUpdateChapterScansFormFields = ({ chapters }: Props) => {
  const { values, setValues, setErrors } =
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
      <Accordion>
        <AccordionItem title="Capítulos">
          {chapters.map((c) => c.number).join(", ")}
        </AccordionItem>
        <AccordionItem title="Capítulos sem scans">
          {chapters
            .filter((c) => c.volume === null)
            .map((c) => c.number)
            .join(", ")}
        </AccordionItem>
      </Accordion>
      <Form.Category
        title="Scans"
        actions={<FormAddButton onPress={handleAdd} />}
      >
        <Form.Col>
          {values.map((_, i) => (
            <>
              {/* biome-ignore lint/suspicious/noArrayIndexKey: we have nothing better to use as a key here */}
              <Form.Row key={i} className="items-start">
                <ScansFormField name={`[${i}].scanIds`} />
                <div className="w-full md:max-w-lg">
                  <RangeFormField name={`[${i}].ids`} chapters={chapters} />
                </div>
                <FormDeleteButton className="mt-7" onPress={handleDelete(i)} />
              </Form.Row>
              {i < values.length - 1 && <Divider />}
            </>
          ))}
        </Form.Col>
      </Form.Category>
      <Form.Actions>
        <SubmitButton>Salvar</SubmitButton>
      </Form.Actions>
    </Form.Layout>
  )
}
