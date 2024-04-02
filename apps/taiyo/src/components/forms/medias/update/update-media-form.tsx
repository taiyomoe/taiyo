"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { type UpdateMediaInput, updateMediaSchema } from "@taiyomoe/schemas"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Form } from "~/components/generics/newForm/new-form"
import { ObjectUtils } from "~/lib/utils/object.utils"
import { api } from "~/trpc/react"
import { UpdateMediaFormFields } from "./update-media-form-fields"

type Props = {
  initialValues: UpdateMediaInput
}

export const UpdateMediaForm = ({ initialValues }: Props) => {
  const { mutateAsync } = api.medias.update.useMutation()
  const methods = useForm<UpdateMediaInput>({
    resolver: zodResolver(updateMediaSchema),
    defaultValues: initialValues,
    mode: "onTouched",
  })

  const handleSubmit: SubmitHandler<UpdateMediaInput> = (values) => {
    const delta = ObjectUtils.deepDifference(values, initialValues)
    const payload = {
      ...delta,
      id: values.id,
      tags: values.tags,
      genres: values.genres,
    }

    toast.promise(mutateAsync(payload), {
      loading: "Salvando alterações...",
      success: () => {
        methods.reset(values)

        return "Alterações salvas com sucesso!"
      },
      error: "Não foi possível salvar as alterações.",
    })
  }

  return (
    <Form.Component onSubmit={handleSubmit} {...methods}>
      <UpdateMediaFormFields />
    </Form.Component>
  )
}
