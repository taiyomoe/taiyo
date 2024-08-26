"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  type UpdateUserSettingsInput,
  updateUserSettingsSchema,
} from "@taiyomoe/schemas"
import { ObjectUtils } from "@taiyomoe/utils"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { SubmitButton } from "~/components/generics/buttons/submit-button"
import { Form } from "~/components/generics/form/form"
import { api } from "~/trpc/react"
import { UpdateUserSettingsFormFields } from "./update-user-settings-form-fields"

type Props = {
  initialValues: UpdateUserSettingsInput
}

export const UpdateUserSettingsForm = ({ initialValues }: Props) => {
  const { mutateAsync } = api.users.updateSettings.useMutation()
  const methods = useForm<UpdateUserSettingsInput>({
    resolver: zodResolver(updateUserSettingsSchema),
    defaultValues: initialValues,
    mode: "onTouched",
  })

  const handleSubmit: SubmitHandler<UpdateUserSettingsInput> = (values) => {
    const delta = ObjectUtils.deepDiff(initialValues, values)

    toast.promise(mutateAsync(delta), {
      loading: "Salvando alterações...",
      success: () => {
        methods.reset(values)

        return "Alterações salvas com sucesso!"
      },
      error: "Não foi possível salvar as alterações.",
    })
  }

  return (
    <Form.Component className="grow" onSubmit={handleSubmit} {...methods}>
      <UpdateUserSettingsFormFields />
      <SubmitButton className="self-end">Salvar</SubmitButton>
    </Form.Component>
  )
}
