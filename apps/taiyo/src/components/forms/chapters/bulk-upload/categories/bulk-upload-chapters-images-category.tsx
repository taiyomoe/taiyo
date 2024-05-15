import { Card, CardBody } from "@nextui-org/card"
import type { UploadChaptersInput } from "@taiyomoe/image-orchestrator"
import { useCallback, useState } from "react"
import { FileTrigger, type FileTriggerProps } from "react-aria-components"
import { useFieldArray } from "react-hook-form"
import { Form } from "~/components/generics/newForm/new-form"
import { AssetSelection } from "~/components/ui/AssetSelection"
import { BulkUploadChapterCard } from "~/components/ui/bulk-upload/bulk-upload-chapter-card"
import { BulkUploadInvalidFilesModal } from "~/components/ui/bulk-upload/bulk-upload-invalid-files-modal"
import type { InvalidFile } from "~/lib/types"
import { ImageUtils } from "~/lib/utils/image.utils"

export const BulkUploadChaptersImagesCategory = () => {
  const { fields, append } = useFieldArray<UploadChaptersInput>({
    name: "chapters",
  })
  const [invalidFiles, setInvalidFiles] = useState<InvalidFile[]>([])

  const handleSelect: NonNullable<FileTriggerProps["onSelect"]> = useCallback(
    (fileList) => {
      if (!fileList) return

      const { invalidFiles, chapters } =
        ImageUtils.computeRelativePaths(fileList)

      for (const [number, files] of chapters) {
        append({
          number,
          contentRating: "NORMAL",
          flag: "OK",
          language: "pt_br",
          scanIds: [],
          files,
        })
      }

      setInvalidFiles(invalidFiles)
    },
    [append],
  )

  return (
    <Form.Category title="Capítulos">
      <FileTrigger acceptDirectory onSelect={handleSelect}>
        <Card
          className="h-full rounded-medium data-[selected=true]:hidden"
          data-selected={fields.length !== 0}
          isPressable={!fields.length}
          disableAnimation
        >
          <CardBody
            as="section"
            className="scrollbar-track-content2 scrollbar-thumb-primary scrollbar-thin !duration-150 max-h-[498px] rounded-medium border-default border-dashed transition-background data-[selected=false]:hover:cursor-pointer data-[selected=true]:gap-3 data-[selected=true]:rounded-r-none data-[selected=false]:border data-[selected=false]:hover:bg-default-200"
            data-selected={fields.length !== 0}
          >
            {fields.length === 0 && <AssetSelection type="folder" />}
          </CardBody>
        </Card>
      </FileTrigger>

      {fields.length !== 0 && (
        <div className="flex flex-col gap-2">
          {fields.map((chapter, i) => (
            <BulkUploadChapterCard
              key={chapter.id}
              chapter={chapter}
              position={`${i + 1}/${fields.length}`}
              index={i}
            />
          ))}
        </div>
      )}

      <BulkUploadInvalidFilesModal
        files={invalidFiles}
        onDismiss={() => setInvalidFiles([])}
      />
    </Form.Category>
  )
}
