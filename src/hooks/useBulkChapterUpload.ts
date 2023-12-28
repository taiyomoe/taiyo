import { FormikConfig } from "formik"
import { useEffect } from "react"
import { toast } from "sonner"
import { useRawChapterUpload } from "~/hooks/useRawChapterUpload"
import { BulkUploadMediaChapters } from "~/lib/schemas"
import { useImageFolderStore } from "~/stores"

async function until(conditionFunction: () => boolean): Promise<void> {
  function poll(resolve: () => void): void {
    if (conditionFunction()) resolve()
    else setTimeout(() => poll(resolve), 400)
  }

  return new Promise(poll)
}

export const useBulkChapterUpload = () => {
  const { folders, compress, toggleStatus, reset } = useImageFolderStore()
  const { upload } = useRawChapterUpload()

  const handleSubmit: FormikConfig<BulkUploadMediaChapters>["onSubmit"] =
    async (values, helpers) => {
      let currentlyOngoing = 0

      const process = async (chapterNumber: number) => {
        await compress(chapterNumber)

        const [_, files] = folders.find(([n]) => n === chapterNumber)!

        toggleStatus(chapterNumber, "uploading")

        await upload(
          { mediaId: values.mediaId, number: chapterNumber },
          files,
        )()

        toggleStatus(chapterNumber, "uploaded")
        toggleStatus(chapterNumber, "uploading")
        currentlyOngoing -= 1
      }

      for (const [chapterNumber] of folders) {
        await until(() => currentlyOngoing !== values.concurrent)

        currentlyOngoing += 1

        console.log("process", chapterNumber)

        void process(chapterNumber)
      }

      await until(() => currentlyOngoing === 0)

      helpers.setSubmitting(false)
      toast.success("Capítulos upados!")
      reset()
    }

  useEffect(() => {
    return reset
  }, [reset])

  return {
    handleSubmit,
  }
}
