import { Card, CardBody } from "@nextui-org/card"
import { useDropzone } from "react-dropzone"
import { useFormContext } from "react-hook-form"
import { Form } from "~/components/generics/newForm/new-form"
import { cn } from "~/lib/utils/cn"

export const MediaFormCoverCategory = () => {
  const { setValue } = useFormContext()
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    onDrop: (files) => {
      setValue("cover", files[0])
    },
    maxFiles: 1,
    accept: {
      "image/webp": [".webp"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
    },
  })

  return (
    <Form.Category title="Cover">
      <Card className="h-full rounded-medium w-fit">
        <CardBody className="p-0">
          <section
            {...getRootProps({
              className: cn(
                "h-[300px] min-w-[200px] max-w-[200px] w-full rounded-medium bg-default-100 transition-background !duration-150 hover:cursor-pointer hover:bg-default-200 flex flex-col text-center justify-center gap-6",
                {
                  "p-3 border border-dashed border-default":
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
                className="object-cover h-full w-full rounded-medium"
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
