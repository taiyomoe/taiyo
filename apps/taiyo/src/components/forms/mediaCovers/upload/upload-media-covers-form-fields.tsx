import { Card, CardBody } from "@nextui-org/card"
import { ContentRating, Languages } from "@taiyomoe/db"
import type { UploadCoversInput } from "@taiyomoe/image-orchestrator"
import { useDropzone } from "react-dropzone"
import { useFieldArray } from "react-hook-form"
import { List } from "~/components/generics/List"
import { SubmitButton } from "~/components/generics/buttons/new-submit-button"
import { InputField } from "~/components/generics/newForm/input-field"
import { Form } from "~/components/generics/newForm/new-form"
import { SelectField } from "~/components/generics/newForm/select-field"
import { AssetSelection } from "~/components/ui/AssetSelection"
import { DEFAULT_MIME_TYPES } from "~/lib/utils/constants"

export const UploadMediaCoversFormFields = () => {
  const { fields, append } = useFieldArray<UploadCoversInput>({
    name: "covers",
  })
  const { getRootProps, getInputProps } = useDropzone({
    accept: DEFAULT_MIME_TYPES,
    onDrop: (files) => {
      append(
        files.map((file) => ({
          volume: undefined,
          contentRating: "NORMAL",
          language: "pt_br",
          file,
        })),
      )

      console.log("dropped files", files)
    },
  })
  const { onClick, ...rootProps } = getRootProps()

  return (
    <Form.Layout>
      <Form.Category title="Upar covers">
        <Card>
          <CardBody
            as="section"
            className="scrollbar-track-content2 scrollbar-thumb-primary scrollbar-thin !duration-150 max-h-[673px] data-[selected=false]:hover:cursor-pointer data-[selected=false]:hover:bg-default-200"
            data-selected={fields.length !== 0}
            onClick={fields.length === 0 ? onClick : undefined}
            {...rootProps}
          >
            <input {...getInputProps()} />
            {fields.length === 0 && <AssetSelection type="image" />}
            {fields.length !== 0 && (
              <List className="gap-4">
                {fields.map(({ id, file }, i) => (
                  <div key={id} className="flex gap-2">
                    <img
                      className="h-[300px] w-[210px] rounded-medium object-cover"
                      src={URL.createObjectURL(file)}
                      alt={`Selected file ${i + 1}`}
                    />
                    <div className="grow p-2">
                      <Form.Col>
                        <Form.Row>
                          <SelectField
                            label="Classificação"
                            name={`covers.${i}.contentRating`}
                            items={ContentRating}
                            aria-label="Content rating"
                            variant="faded"
                          />
                          <InputField
                            label="Volume"
                            labelPlacement="outside"
                            name={`covers.${i}.volume`}
                            placeholder="Ex: 1"
                            type="number"
                            variant="faded"
                          />
                        </Form.Row>
                        <Form.Row>
                          <SelectField
                            label="Língua"
                            name={`covers.${i}.language`}
                            items={Languages}
                            aria-label="Languages"
                            variant="faded"
                          />
                        </Form.Row>
                      </Form.Col>
                    </div>
                  </div>
                ))}
              </List>
            )}
          </CardBody>
        </Card>
      </Form.Category>
      <Form.Actions>
        <SubmitButton>Upar</SubmitButton>
      </Form.Actions>
    </Form.Layout>
  )
}
