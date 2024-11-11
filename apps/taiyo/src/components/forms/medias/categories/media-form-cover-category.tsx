import { Card, CardBody } from "@nextui-org/card"
import { ContentRating, Languages } from "@taiyomoe/db"
import { useDropzone } from "react-dropzone"
import { useFormContext } from "react-hook-form"
import { Form } from "~/components/generics/form/form"
import { InputField } from "~/components/generics/form/input-field"
import { SelectField } from "~/components/generics/form/select-field"
import { DEFAULT_MIME_TYPES } from "~/lib/utils/constants"

export const MediaFormCoverCategory = () => {
  const { setValue, watch } = useFormContext()
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: DEFAULT_MIME_TYPES,
    maxFiles: 1,
    onDrop: (files) => {
      setValue("mainCover", files[0], {
        shouldValidate: true,
        shouldDirty: true,
      })
    },
  })
  const selectedFile = watch("mainCover") as File

  return (
    <Form.Category title="Cover">
      <Form.Row>
        <Card className="mx-auto h-[300px] min-w-[200px] max-w-[200px] rounded-medium md:mx-0">
          <CardBody
            as="section"
            className="!duration-150 flex items-center justify-center gap-6 rounded-medium border-default border-dashed text-center transition-background data-[selected=false]:border data-[selected=true]:p-0 data-[selected=false]:hover:cursor-pointer data-[selected=false]:hover:bg-default-200"
            data-selected={selectedFile !== undefined}
            {...getRootProps()}
          >
            <input {...getInputProps()} disabled={acceptedFiles.length !== 0} />
            {acceptedFiles.length === 0 && (
              <>
                <p>Nenhuma imagem selecionada.</p>
                <p>Arreste-a nesta zona ou clique para selecioná-la.</p>
              </>
            )}
            {acceptedFiles.length !== 0 && (
              <img
                className="h-full w-full rounded-medium object-cover"
                src={URL.createObjectURL(acceptedFiles[0]!)}
                alt="uploaded media preview"
              />
            )}
          </CardBody>
        </Card>
        <Form.Col>
          <SelectField
            name="mainCoverLanguage"
            label="Idioma"
            items={Languages}
            isRequired
          />

          <SelectField
            name="mainCoverContentRating"
            label="Classificação"
            items={ContentRating}
            isRequired
          />

          <InputField
            name="volume"
            label="Volume"
            labelPlacement="outside"
            placeholder="Ex: 1"
            type="number"
          />
        </Form.Col>
      </Form.Row>
    </Form.Category>
  )
}
