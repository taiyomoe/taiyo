import { Card, CardBody } from "@nextui-org/card"
import { useDropzone } from "react-dropzone"
import { useFormContext } from "react-hook-form"
import { Form } from "~/components/generics/form/new-form"
import { cn } from "~/lib/utils/cn"
import { DEFAULT_MIME_TYPES } from "~/lib/utils/constants"

export const MediaFormCoverCategory = () => {
  const { setValue } = useFormContext()
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: DEFAULT_MIME_TYPES,
    maxFiles: 1,
    onDrop: (files) => {
      setValue("cover", files[0], { shouldValidate: true, shouldDirty: true })
    },
  })

  return (
    <Form.Category title="Cover">
      <Card className="h-full w-fit rounded-medium">
        <CardBody className="p-0">
          <section
            {...getRootProps({
              className: cn(
                "!duration-150 flex h-[300px] w-full min-w-[200px] max-w-[200px] flex-col justify-center gap-6 rounded-medium bg-default-100 text-center transition-background",
                {
                  "border border-default border-dashed p-3":
                    acceptedFiles.length === 0,
                },
              ),
            })}
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
          </section>
        </CardBody>
      </Card>
    </Form.Category>
  )
}
