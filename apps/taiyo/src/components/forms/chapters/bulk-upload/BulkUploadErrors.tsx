import { useAtomValue } from "jotai"
import { Form } from "~/components/generics/form/Form"
import { bulkChapterUploadErrorsAtom } from "~/hooks/useBulkChapterUpload"

export const BulkUploadErrors = () => {
  const errors = useAtomValue(bulkChapterUploadErrorsAtom)

  if (errors.length === 0) {
    return null
  }

  return (
    <Form.Category title="Erros">
      <div className="flex flex-col">
        {errors.map((err) => (
          <div key={err.chapterNumber} className="flex gap-2">
            <p>Capítulo {err.chapterNumber}</p>—<p>{err.message}</p>
          </div>
        ))}
      </div>
    </Form.Category>
  )
}
