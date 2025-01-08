import type { InvalidFile } from "~/lib/types"
import { BulkUploadInvalidFilesCategory } from "./bulk-upload-invalid-files-category"

type Props = {
  files: InvalidFile[]
}

export const BulkUploadInvalidFilesShowcase = ({ files }: Props) => {
  const invalidMimeType = files.filter((file) => file.reason === "mimeType")
  const invalidChapterNumber = files.filter(
    (file) => file.reason === "chapterNumber",
  )

  return (
    <div className="flex flex-col gap-4">
      {invalidMimeType.length > 0 && (
        <BulkUploadInvalidFilesCategory
          title="Extensão inválida"
          files={invalidMimeType}
        />
      )}
      {invalidChapterNumber.length > 0 && (
        <BulkUploadInvalidFilesCategory
          title="Numeração inválida"
          files={invalidChapterNumber}
        />
      )}
    </div>
  )
}
