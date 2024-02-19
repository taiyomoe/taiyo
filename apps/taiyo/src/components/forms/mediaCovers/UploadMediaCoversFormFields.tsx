import { ContentRating, Languages } from "@prisma/client"
import type { UploadMediaCoverSchema } from "@taiyomoe/schemas"
import { useFormikContext } from "formik"
import { useCallback } from "react"
import { List } from "~/components/generics/List"
import { Form } from "~/components/generics/form/Form"
import { InputFormField } from "~/components/generics/form/InputFormField"
import { SelectFormField } from "~/components/generics/form/SelectFormField"
import { SwitchFormField } from "~/components/generics/form/SwitchFormField"
import { ImageDropzone } from "~/components/ui/upload/ImageDropzone"

export const UploadMediaCoversFormFields = () => {
  const { setValues } = useFormikContext<UploadMediaCoverSchema>()

  const handleDrop = async (filesLength: number) => {
    await setValues((prev) =>
      prev.concat(
        Array.from({ length: filesLength }).map((_, i) => ({
          contentRating: "NORMAL",
          volume: prev.length + i + 1,
          isMainCover: false,
          language: "ja",
        })),
      ),
    )
  }

  const handleSwitchChange = useCallback(
    (imageIndex: number) => (newValue: boolean) => {
      void setValues((prev) =>
        prev.map((x, i) => ({
          ...x,
          isMainCover: newValue ? i === imageIndex : false,
        })),
      )
    },
    [setValues],
  )

  return (
    <ImageDropzone title="Upar covers" type="COVER" onDrop={handleDrop}>
      {({ selectedImages }) => (
        <List className="gap-4">
          {selectedImages.map((file, i) => (
            <div key={file.name} className="flex gap-2">
              <img
                className="h-[300px] w-[210px] rounded-medium object-cover"
                src={URL.createObjectURL(file)}
                alt={`Selected file ${i + 1}`}
              />
              <div className="grow p-2">
                <Form.Col>
                  <Form.Row>
                    <SelectFormField
                      label="Classificação"
                      name={`[${i}].contentRating`}
                      items={ContentRating}
                      aria-label="Content rating"
                      variant="faded"
                    />
                    <InputFormField
                      label="Volume"
                      labelPlacement="outside"
                      name={`[${i}].volume`}
                      type="number"
                      variant="faded"
                    />
                  </Form.Row>
                  <Form.Row>
                    <SelectFormField
                      label="Língua"
                      name={`[${i}].language`}
                      items={Languages}
                      aria-label="Languages"
                      variant="faded"
                    />
                    <SwitchFormField
                      label="Capa principal"
                      labelPlacement="outside"
                      name={`[${i}].isMainCover`}
                      onChange={handleSwitchChange(i)}
                    />
                  </Form.Row>
                </Form.Col>
              </div>
            </div>
          ))}
        </List>
      )}
    </ImageDropzone>
  )
}
