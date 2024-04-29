import { typeboxResolver } from "@hookform/resolvers/typebox"
import {
  type UploadCoversInput,
  uploadCoversSchema,
} from "@taiyomoe/image-orchestrator"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Form } from "~/components/generics/newForm/new-form"
import { ioApi } from "~/eden/client"
import { parallel } from "~/lib/utils/array.utils"
import { useMediaUpdateStore } from "~/stores"
import { UploadMediaCoversFormFields } from "./upload-media-covers-form-fields"

type Props = {
  mediaId: string
}

export const UploadMediaCoversForm = ({ mediaId }: Props) => {
  const methods = useForm<UploadCoversInput>({
    resolver: typeboxResolver(uploadCoversSchema),
    mode: "onTouched",
    defaultValues: { covers: [] },
  })
  const { addCover } = useMediaUpdateStore()

  const handleSubmit: SubmitHandler<UploadCoversInput> = async (values) => {
    await parallel(
      5,
      values.covers,
      (cover, i) =>
        new Promise((resolve) => {
          toast.promise(ioApi.covers.upload({ ...cover, mediaId }), {
            loading: `Upando a capa ${i + 1}/${values.covers.length}...`,
            success: ({ data }) => {
              console.log("data", data)
              addCover([data])
              resolve(null)

              return `Capa ${i + 1} upada!`
            },
            error: () => {
              return `Ocorreu um erro inesperado ao upar a capa ${i + 1}`
            },
          })
        }),
    )

    methods.reset({ covers: [] })
  }

  return (
    <Form.Component {...methods} onSubmit={handleSubmit}>
      <UploadMediaCoversFormFields />
    </Form.Component>
  )
}
