import { FormikConfig } from "formik"
import { atom, useSetAtom } from "jotai"
import { useEffect } from "react"
import { toast } from "sonner"
import { useRawChapterUpload } from "~/hooks/useRawChapterUpload"
import { BulkUploadMediaChapters } from "~/lib/schemas"
import { ImageError } from "~/lib/types"
import { useImageFolderStore } from "~/stores"

async function until(conditionFunction: () => boolean): Promise<void> {
  function poll(resolve: () => void): void {
    if (conditionFunction()) resolve()
    else setTimeout(() => poll(resolve), 400)
  }

  return new Promise(poll)
}

export const bulkChapterUploadErrorsAtom = atom<ImageError[]>([])

export const useBulkChapterUpload = () => {
  const { folders, compress, toggleStatus, reset } = useImageFolderStore()
  const { upload } = useRawChapterUpload()
  const setBulkChapterUploadErrors = useSetAtom(bulkChapterUploadErrorsAtom)

  const handleSubmit: FormikConfig<BulkUploadMediaChapters>["onSubmit"] =
    async (values, helpers) => {
      const tempErrors: ImageError[] = []
      let currentlyOngoing = 0

      const handleError =
        (message: string, chapterNumber: number) => (error: unknown) => {
          console.error(error)

          toast.error(`Ocorreu um erro ao upar o capítulo ${chapterNumber}.`)
          tempErrors.push({ message, chapterNumber })

          currentlyOngoing -= 1
        }

      const process = async (chapterNumber: number) => {
        const compressedFiles = await compress(chapterNumber).catch(
          handleError(
            "Ocorreu um erro ao converter uma das imagens.",
            chapterNumber,
          ),
        )

        if (!compressedFiles) {
          return
        }

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

        void process(chapterNumber).catch(
          handleError("Ocorreu um erro durante o upload.", chapterNumber),
        )
      }

      await until(() => currentlyOngoing === 0)

      helpers.setSubmitting(false)

      if (tempErrors.length) {
        toast.warning("Upload terminado. Alguns capítulos não foram upados.", {
          duration: Infinity,
        })
        setBulkChapterUploadErrors(tempErrors)
      } else {
        toast.success("Capítulos upados!")
        reset()
      }
    }

  // biome-ignore lint/correctness/useExhaustiveDependencies: we want this to run only when unmounting
  useEffect(() => {
    return () => {
      setBulkChapterUploadErrors([])
      reset()
    }
  }, [])

  return {
    handleSubmit,
  }
}
