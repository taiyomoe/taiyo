"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { type CreateMediaInput, createMediaSchema } from "@taiyomoe/schemas"
import { useRouter } from "next/navigation"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Form } from "~/components/generics/form/form"
import { handleErrors, ioApi } from "~/utils/hono-rpc"
import { CreateMediaFormFields } from "./create-media-form-fields"

export const CreateMediaForm = () => {
  const router = useRouter()
  const methods = useForm<CreateMediaInput>({
    resolver: zodResolver(createMediaSchema),
    mode: "onTouched",
    defaultValues: {
      startDate: undefined,
      endDate: undefined,
      synopsis: "",
      oneShot: false,
      contentRating: "NORMAL",
      type: "MANGA",
      status: "RELEASING",
      source: "ORIGINAL",
      demography: "SHOUNEN",
      countryOfOrigin: "JAPAN",
      flag: "OK",
      genres: [],
      tags: [],
      mdId: undefined,
      alId: undefined,
      malId: undefined,
      mainTitle: "",
      mainTitleLanguage: "en",
      mainCover: undefined,
      mainCoverLanguage: "en",
      mainCoverContentRating: "NORMAL",
      mainCoverVolume: undefined,
    },
  })

  const handleSubmit: SubmitHandler<CreateMediaInput> = async (values) => {
    toast.promise(ioApi.medias.create(values), {
      loading: "Criando a obra...",
      error: handleErrors("Ocorreu um erro inesperado ao criar a obra"),
      success: ({ id }) => {
        router.push(`/media/${id}`)

        return "Obra criada!"
      },
    })
  }

  return (
    <Form.Component onSubmit={handleSubmit} {...methods}>
      <CreateMediaFormFields />
    </Form.Component>
  )
}
