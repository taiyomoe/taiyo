import { Accordion, AccordionItem, Divider } from "@nextui-org/react"
import { MediaChapter } from "@prisma/client"
import { SubmitButton } from "~/components/generics/buttons/SubmitButton"
import { Form } from "~/components/generics/form/Form"
import { RangeFormField } from "~/components/generics/inputs/RangeFormField"

import { useFormikContext } from "formik"
import { ScansFormField } from "~/components/generics/inputs/ScansFormField"
import { BulkUpdateMediaChapterScansSchema } from "~/lib/schemas"
import { BulkUpdateChapterScansAddButton } from "./BulkUpdateChapterScansAddButton"

type Props = {
  chapters: MediaChapter[]
}

export const BulkUpdateChapterScansFormFields = ({ chapters }: Props) => {
  const { values } = useFormikContext<BulkUpdateMediaChapterScansSchema>()

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
        actions={<BulkUpdateChapterScansAddButton />}
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
