import type { UploadChaptersInput } from "@taiyomoe/image-orchestrator"
import { useCallback, useState } from "react"
import type { FileTriggerProps } from "react-aria-components"
import { useFieldArray } from "react-hook-form"
import { Form } from "~/components/generics/form/form"
import { BulkUploadChapterCard } from "~/components/ui/bulk-upload/bulk-upload-chapter-card"
import { BulkUploadInvalidFilesModal } from "~/components/ui/bulk-upload/bulk-upload-invalid-files-modal"
import { FolderSelection } from "~/components/ui/upload/folder-selection"
import type { InvalidFile } from "~/lib/types"
import { FileUtils } from "~/lib/utils/file.utils"

export const BulkUploadChaptersImagesCategory = () => {
  const { fields, append } = useFieldArray<UploadChaptersInput>({
    name: "chapters",
  })
  const [invalidFiles, setInvalidFiles] = useState<InvalidFile[]>([])

  const handleSelect: NonNullable<FileTriggerProps["onSelect"]> = useCallback(
    (fileList) => {
      if (!fileList) return

      const { invalidFiles, chapters } =
        FileUtils.computeRelativePaths(fileList)

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
      <FolderSelection
        onSelect={handleSelect}
        className="data-[selected=true]:hidden"
        isSelected={fields.length !== 0}
      />

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
