"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { type UpdateScanInput, updateScanSchema } from "@taiyomoe/schemas"
import type { LimitedScan } from "@taiyomoe/types"
import { ObjectUtils } from "@taiyomoe/utils"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { CreateScanFormFields } from "~/components/forms/scans/create/create-scan-form-fields"
import { Form } from "~/components/generics/form/form"
import { api } from "~/trpc/react"

type Props = {
  initialValues: LimitedScan
}

export const UpdateScanForm = ({ initialValues }: Props) => {
  const { mutateAsync } = api.scans.update.useMutation()
  const methods = useForm<UpdateScanInput>({
    resolver: zodResolver(updateScanSchema),
    defaultValues: initialValues,
    mode: "onTouched",
  })

  const handleSubmit: SubmitHandler<UpdateScanInput> = (values) => {
    const delta = ObjectUtils.deepDiff(initialValues, values)
    const payload = {
      ...delta,
      id: values.id,
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
      <CreateScanFormFields action="update" />
    </Form.Component>
  )
}
