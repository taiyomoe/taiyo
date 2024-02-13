import type { FormikConfig } from "formik"
import { toast } from "sonner"
import { toFormikValidationSchema } from "zod-formik-adapter"

import { Form } from "~/components/generics/form/Form"
import { useUpload } from "~/hooks/useUpload"
import { uploadMediaCoverSchema } from "~/lib/schemas"
import type { UploadMediaCoverSchema } from "~/lib/schemas"
import { api } from "~/lib/trpc/client"
import { useImageStore, useMediaUpdateStore } from "~/stores"

import { UploadMediaCoversFormFields } from "./UploadMediaCoversFormFields"

const initialValues: UploadMediaCoverSchema = []

type Props = {
  mediaId: string
}

export const UploadMediaCoversForm = ({ mediaId }: Props) => {
  const { mutateAsync: startUploadSession } =
    api.uploads.startUploadSession.useMutation()
  const { mutateAsync: createCovers } = api.mediaCovers.create.useMutation()
  const { addCover } = useMediaUpdateStore()
  const { reset } = useImageStore()
  const { upload } = useUpload()

  const handleSubmit: FormikConfig<UploadMediaCoverSchema>["onSubmit"] = (
    values,
    { resetForm },
  ) => {
    const handleUpload = async () => {
      const { authToken } = await startUploadSession({
        type: "COVER",
        mediaId,
      })

      const coversId = await upload(authToken, "COVER")

      return await createCovers({
        mediaId,
        covers: values.map((x, i) => ({ ...x, id: coversId[i]! })),
      })
    }

    toast.promise(handleUpload(), {
      loading: "Upando a(s) cover(s)...",
      success: (newCovers) => {
        resetForm()
        reset("COVER")
        addCover(newCovers)

        return "Cover(s) upada(s) com sucesso!"
      },
      error: "Ocorreu um erro ao upar a(s) cover(s).",
    })
  }

  return (
    <Form.Component
      validationSchema={toFormikValidationSchema(uploadMediaCoverSchema)}
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      <UploadMediaCoversFormFields />
    </Form.Component>
  )
}
