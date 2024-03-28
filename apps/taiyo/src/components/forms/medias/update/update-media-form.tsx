"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { type UpdateMediaInput, updateMediaSchema } from "@taiyomoe/schemas"
import { omit } from "lodash-es"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Form } from "~/components/generics/newForm/new-form"
import { ObjectUtils } from "~/lib/utils/object.utils"
import { api } from "~/trpc/react"
import { MediaFormFields } from "../media-form-fields"

type Props = {
  initialValues: UpdateMediaInput
}

export const UpdateMediaForm = ({ initialValues }: Props) => {
  const { mutateAsync } = api.medias.update.useMutation()
  const methods = useForm<UpdateMediaInput>({
    resolver: zodResolver(updateMediaSchema),
    mode: "onTouched",
    defaultValues: omit(initialValues, ["tags"]),
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
      <MediaFormFields action="update" />
    </Form.Component>
  )
}
