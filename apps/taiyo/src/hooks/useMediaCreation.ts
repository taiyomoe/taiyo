import type { InsertMediaSchema } from "@taiyomoe/schemas"
import { TRPCClientError } from "@trpc/client"
import type { FormikConfig } from "formik"
import { toast } from "sonner"
import { api } from "~/lib/trpc/client"

export const useMediaCreation = () => {
  const { mutateAsync: createMedia } = api.medias.create.useMutation()

  const handleSubmit: FormikConfig<InsertMediaSchema>["onSubmit"] = (
    values,
    { resetForm, setSubmitting },
  ) => {
    const uploadImages = async () => {
      await createMedia(values)

      resetForm()

      // TODO: Redirect to the media page
    }

    toast.promise(uploadImages, {
      loading: "Criando a obra...",
      success: "Obra criada!",
      error: (err) =>
        err instanceof TRPCClientError
          ? err.message
          : "Ocorreu um erro ao criar a obra",
      finally: () => {
        setSubmitting(false)
      },
    })
  }

  return { handleSubmit }
}
