import type { UploadChaptersInput } from "@taiyomoe/schemas"
import { useCallback, useState } from "react"
import type { DropzoneProps } from "react-dropzone"
import { useFieldArray } from "react-hook-form"
import { Form } from "~/components/generics/form/form"
import { BulkUploadChapterCard } from "~/components/ui/bulk-upload/bulk-upload-chapter-card"
import { BulkUploadInvalidFilesModal } from "~/components/ui/bulk-upload/bulk-upload-invalid-files-modal"
import { FolderSelection } from "~/components/ui/upload/folder-selection"
import type { InvalidFile, RawSelectedFile } from "~/lib/types"
import { FileUtils } from "~/lib/utils/file.utils"
import { UploadUtils } from "~/utils/upload.utils"
export const BulkUploadChaptersImagesCategory = () => {
  const { fields, append } = useFieldArray<UploadChaptersInput>({
    name: "chapters",
  })
  const [invalidFiles, setInvalidFiles] = useState<InvalidFile[]>([])
  const chapters = fields as (UploadChaptersInput["chapters"][number] & {
    id: string
  })[]

  const handleDrop: NonNullable<DropzoneProps["onDrop"]> = useCallback(
    async (fileList) => {
      const { invalidFiles, chapters } =
        FileUtils.computeRelativePaths(fileList)

      for (const [number, files] of chapters) {
        const parsedFiles = await UploadUtils.parseFiles(files)

        if (parsedFiles.includes(null)) {
          continue
        }

        append({
          number,
          contentRating: "NORMAL",
          flag: "OK",
          language: "pt_br",
          scanIds: [],
          files: parsedFiles as RawSelectedFile[],
        })
      }

      setInvalidFiles(invalidFiles)
    },
    [append],
  )

  return (
    <Form.Category title="Capítulos">
      <FolderSelection
        onDrop={handleDrop}
        className="data-[selected=true]:hidden"
        isSelected={fields.length !== 0}
      />

      {fields.length !== 0 && (
        <div className="flex flex-col gap-2">
          {chapters.map((chapter, i) => (
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
