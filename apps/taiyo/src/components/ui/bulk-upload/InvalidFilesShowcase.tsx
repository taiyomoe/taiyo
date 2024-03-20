import type { InvalidFile } from "~/lib/types"
import { InvalidFilesCategory } from "./InvalidFilesCategory"

type Props = {
  files: InvalidFile[]
}

export const InvalidFilesShowcase = ({ files }: Props) => {
  const invalidMimeType = files.filter((file) => file.reason === "mimeType")
  const invalidChapterNumber = files.filter(
    (file) => file.reason === "chapterNumber",
  )

  return (
    <div className="flex flex-col gap-4">
      {invalidMimeType.length > 0 && (
        <InvalidFilesCategory
          title="Extensão inválida"
          files={invalidMimeType}
        />
      )}
      {invalidChapterNumber.length > 0 && (
        <InvalidFilesCategory
          title="Numeração inválida"
          files={invalidChapterNumber}
        />
      )}
    </div>
  )
}
