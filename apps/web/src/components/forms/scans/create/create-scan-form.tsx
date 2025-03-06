"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { type CreateScanInput, createScanSchema } from "@taiyomoe/schemas"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Form } from "~/components/generics/form/form"
import { useErrorHandler } from "~/hooks/useErrorHandler"
import { api } from "~/trpc/react"
import { CreateScanFormFields } from "./create-scan-form-fields"

const initialValues: CreateScanInput = {
  name: "",
  description: "",
  logo: "",
  banner: "",
  website: "",
  discord: "",
  twitter: "",
  facebook: "",
  instagram: "",
  telegram: "",
  youtube: "",
  email: "",
}

export const CreateScanForm = () => {
  const { mutateAsync } = api.scans.create.useMutation()
  const { handleError } = useErrorHandler()
  const methods = useForm<CreateScanInput>({
    resolver: zodResolver(createScanSchema),
    mode: "onTouched",
    defaultValues: initialValues,
  })

  const handleSubmit: SubmitHandler<CreateScanInput> = (values) => {
    toast.promise(mutateAsync(values), {
      loading: "Adicionando scan...",
      success: () => {
        methods.reset()

        return "Scan adicionada com sucesso!"
      },
      error: handleError("Ocorreu um erro inesperado ao adicionar a scan."),
    })
  }

  return (
    <Form.Component onSubmit={handleSubmit} {...methods}>
      <CreateScanFormFields action="create" />
    </Form.Component>
  )
}
