"use client"

import { typeboxResolver } from "@hookform/resolvers/typebox"
import {
  type CreateMediaInput,
  createMediaSchema,
} from "@taiyomoe/image-orchestrator"
import { useRouter } from "next/navigation"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Form } from "~/components/generics/newForm/new-form"
import { handleErrors, ioApi } from "~/eden/client"
import { CreateMediaFormFields } from "./create-media-form-fields"

export const CreateMediaForm = () => {
  const router = useRouter()
  const methods = useForm<CreateMediaInput>({
    resolver: typeboxResolver(createMediaSchema),
    mode: "onTouched",
    defaultValues: {
      startDate: undefined,
      endDate: undefined,
      synopsis: "",
      contentRating: "NORMAL",
      oneShot: false,
      type: "MANGA",
      status: "RELEASING",
      source: "ORIGINAL",
      demography: "SHOUNEN",
      countryOfOrigin: "JAPAN",
      flag: "OK",
      genres: [],
      tags: [],
      mainTitle: "",
      mdId: undefined,
      alId: undefined,
      malId: undefined,
    },
  })

  const handleSubmit: SubmitHandler<CreateMediaInput> = async (values) => {
    console.log("values", values)

    toast.promise(ioApi.medias.create(values), {
      loading: "Criando a obra...",
      error: handleErrors("Ocorreu um erro inesperado ao criar a obra"),
      success: ({ data }) => {
        router.push(`/media/${data.id}`)

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
