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
        const compressedFiles = await compress(chapterNumber)

        toggleStatus(chapterNumber, "uploading")

        await upload(
          { mediaId: values.mediaId, number: chapterNumber },
          compressedFiles,
        )()

        toggleStatus(chapterNumber, "uploaded")
        toggleStatus(chapterNumber, "uploading")
        currentlyOngoing -= 1
      }

      for (const [chapterNumber] of folders) {
        await until(() => currentlyOngoing !== values.concurrent)

        currentlyOngoing += 1

        void process(chapterNumber).catch((err) => {
          console.error(err)
          toast.error(`Ocorreu um erro ao upar o capítulo${chapterNumber}`)
          currentlyOngoing -= 1
        })
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
