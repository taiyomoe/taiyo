import type { InsertMediaChapterFormSchema } from "@taiyomoe/schemas"
import { TRPCClientError } from "@trpc/client"
import type { FormikConfig } from "formik"
import { toast } from "sonner"
import { useRawChapterUpload } from "~/hooks/useRawChapterUpload"
import { useImageStore } from "~/stores"

export const useChapterUpload = () => {
  const { upload } = useRawChapterUpload()
  const { getImages, reset } = useImageStore()
  const selectedImages = getImages("CHAPTER")

  const handleSubmit: FormikConfig<InsertMediaChapterFormSchema>["onSubmit"] = (
    values,
    helpers,
  ) => {
    toast.promise(upload(values, selectedImages), {
      loading: "Upando o capítulo...",
      success: () => {
        const newNumberValue = Number.isInteger(values.number)
          ? values.number + 1
          : values.number + 0.5

        helpers.resetForm()
        void helpers.setFieldValue("mediaId", values.mediaId)
        void helpers.setFieldValue("number", newNumberValue)
        void helpers.setFieldValue("volume", values.volume)
        void helpers.setFieldValue("scanIds", values.scanIds)

        reset("CHAPTER")

        return "Capítulo upado!"
      },
      error: (err) =>
        err instanceof TRPCClientError
          ? err.message
          : "Ocorreu um erro ao upar o capítulo",
      finally: () => {
        helpers.setSubmitting(false)
      },
    })
  }

  return { handleSubmit }
}
