import { Accordion, AccordionItem } from "@nextui-org/react"
import { MediaChapter } from "@prisma/client"
import { SubmitButton } from "~/components/generics/buttons/SubmitButton"
import { Form } from "~/components/generics/form/Form"
import { InputFormField } from "~/components/generics/form/InputFormField"
import { RangeFormField } from "~/components/generics/inputs/RangeFormField"

import { useFormikContext } from "formik"
import { BulkUpdateMediaChapterVolumesSchema } from "~/lib/schemas"
import { BulkUpdateChapterVolumesAddVolumeButton } from "./BulkUpdateChapterVolumesAddVolumeButton"

type Props = {
  chapters: MediaChapter[]
}

export const BulkUpdateChapterVolumesFormFields = ({ chapters }: Props) => {
  const { values } = useFormikContext<BulkUpdateMediaChapterVolumesSchema>()

  return (
    <Form.Layout>
      <Accordion>
        <AccordionItem title="Capítulos">
          {chapters.map((c) => c.number).join(", ")}
        </AccordionItem>
        <AccordionItem title="Capítulos sem volume">
          {chapters
            .filter((c) => c.volume === null)
            .map((c) => c.number)
            .join(", ")}
        </AccordionItem>
      </Accordion>
      <Form.Category
        title="Volumes"
        actions={<BulkUpdateChapterVolumesAddVolumeButton />}
      >
        <Form.Col>
          {values
            .sort((a, b) => b.volume - a.volume)
            .map((_, i) => (
              <Form.Row key={_.volume} className="items-start">
                <InputFormField
                  name={`[${i}].volume`}
                  label="Volume"
                  labelPlacement="outside"
                  className="min-w-[100px] w-[100px]"
                />
                <RangeFormField name={`[${i}].ids`} chapters={chapters} />
              </Form.Row>
            ))}
        </Form.Col>
      </Form.Category>
      <Form.Actions>
        <SubmitButton>Salvar</SubmitButton>
      </Form.Actions>
    </Form.Layout>
  )
}
