"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { type ImportMediaInput, importMediaSchema } from "@taiyomoe/schemas"
import { useRouter } from "next/navigation"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { SubmitButton } from "~/components/generics/buttons/submit-button"
import { Form } from "~/components/generics/form/form"
import { InputField } from "~/components/generics/form/input-field"
import { SwitchField } from "~/components/generics/form/switch-field"
import { api } from "~/trpc/react"

export const ImportMediaForm = () => {
  const { mutateAsync } = api.medias.import.useMutation()
  const methods = useForm<ImportMediaInput>({
    resolver: zodResolver(importMediaSchema),
    mode: "onTouched",
    defaultValues: {
      mdId: "",
      importCovers: true,
      importChapters: true,
    },
  })
  const router = useRouter()

  const handleSubmit: SubmitHandler<ImportMediaInput> = (values) => {
    return new Promise((resolve, reject) => {
      toast.promise(mutateAsync(values), {
        loading: "Importando...",
        success: (data) => {
          methods.reset()
          router.push(`/dashboard/sessions/${data.sessionId}`)
          resolve(data)

          return "Obra criada com sucesso! Upload de covers e capítulos em andamento..."
        },
        error: () => {
          reject()

          return "Ocorreu um erro inesperado ao importar a obra."
        },
      })
    })
  }

  return (
    <Form.Component {...methods} onSubmit={handleSubmit}>
      <Form.Col>
        <Form.Row>
          <InputField
            name="mdId"
            label="ID na MangaDex"
            labelPlacement="outside"
            placeholder="93c8f7f8-58cc-40fe-9146-3f68cbfc71af"
            isRequired
          />
          <SubmitButton className="self-end">Importar</SubmitButton>
        </Form.Row>
        <Form.Row>
          <SwitchField name="importCovers" label="Baixar e upar covers?" />
          <SwitchField name="importChapters" label="Baixar e upar capítulos?" />
        </Form.Row>
      </Form.Col>
    </Form.Component>
  )
}
