import { Button } from "@nextui-org/button"
import { Card, CardBody } from "@nextui-org/card"
import { useDropzone } from "react-dropzone"
import { useFormContext } from "react-hook-form"
import { Form } from "~/components/generics/newForm/new-form"
import { AssetSelection } from "~/components/ui/AssetSelection"
import { ImageCard } from "~/components/ui/upload/ImageCard"
import { DEFAULT_MIME_TYPES } from "~/lib/utils/constants"

export const ChapterFormImagesCategory = () => {
  const { setValue } = useFormContext()
  const { getRootProps, getInputProps, open, acceptedFiles } = useDropzone({
    accept: DEFAULT_MIME_TYPES,
    onDrop: (files) => {
      setValue("files", files, { shouldValidate: true })
    },
  })

  return (
    <Form.Category
      title="Imagens"
      actions={
        <Button className="font-medium" onClick={open} color="primary">
          Selecionar
        </Button>
      }
    >
      <Card className="h-full rounded-medium">
        <CardBody
          as="section"
          className="max-h-[498px] scrollbar-track-content2 scrollbar-thumb-primary scrollbar-thin border-dashed border-default data-[selected=false]:border rounded-medium data-[selected=true]:rounded-r-none transition-background !duration-150 data-[selected=false]:hover:cursor-pointer data-[selected=false]:hover:bg-default-200 data-[selected=true]:gap-3"
          data-selected={acceptedFiles.length !== 0}
          {...getRootProps()}
        >
          <input {...getInputProps()} disabled={acceptedFiles.length !== 0} />
          {acceptedFiles.length === 0 && <AssetSelection type="image" />}
          {acceptedFiles.length !== 0 &&
            acceptedFiles.map((f, i) => (
              <ImageCard
                key={f.name}
                file={f}
                position={`${i + 1}/${acceptedFiles.length}`}
              />
            ))}
        </CardBody>
      </Card>
    </Form.Category>
  )
}
