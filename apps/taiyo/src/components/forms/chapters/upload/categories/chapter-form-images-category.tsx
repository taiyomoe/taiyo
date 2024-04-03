import { Button } from "@nextui-org/button"
import { Card, CardBody } from "@nextui-org/card"
import { useDropzone } from "react-dropzone"
import { useFormContext } from "react-hook-form"
import { Form } from "~/components/generics/newForm/new-form"
import { AssetSelection } from "~/components/ui/AssetSelection"
import { ImageCard } from "~/components/ui/upload/ImageCard"
import { DEFAULT_MIME_TYPES } from "~/lib/utils/constants"

export const ChapterFormImagesCategory = () => {
  const { setValue, watch } = useFormContext()
  const { getRootProps, getInputProps, open } = useDropzone({
    accept: DEFAULT_MIME_TYPES,
    onDrop: (files) => {
      setValue("files", files, { shouldValidate: true, shouldDirty: true })
    },
  })
  const selectedFiles = watch("files") as File[]

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
          className="scrollbar-track-content2 scrollbar-thumb-primary scrollbar-thin !duration-150 max-h-[498px] rounded-medium border-default border-dashed transition-background data-[selected=false]:hover:cursor-pointer data-[selected=true]:gap-3 data-[selected=true]:rounded-r-none data-[selected=false]:border data-[selected=false]:hover:bg-default-200"
          data-selected={selectedFiles.length !== 0}
          {...getRootProps()}
        >
          <input {...getInputProps()} disabled={selectedFiles.length !== 0} />
          {selectedFiles.length === 0 && <AssetSelection type="image" />}
          {selectedFiles.length !== 0 &&
            selectedFiles.map((f, i) => (
              <ImageCard
                key={f.name}
                file={f}
                position={`${i + 1}/${selectedFiles.length}`}
              />
            ))}
        </CardBody>
      </Card>
    </Form.Category>
  )
}
