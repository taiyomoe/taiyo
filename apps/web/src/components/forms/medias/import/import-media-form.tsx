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
import { useErrorHandler } from "~/hooks/useErrorHandler"
import { api } from "~/trpc/react"

export const ImportMediaForm = () => {
  const { mutateAsync } = api.medias.import.useMutation()
  const { handleError } = useErrorHandler()
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
        error: handleError(
          "Ocorreu um erro inesperado ao importar a obra.",
          reject,
        ),
      })
    })
  }

  return (
    <Form.Component {...methods} onSubmit={handleSubmit}>
      <Form.Col>
        <Form.Row>
          <InputField
            name="mdId"
            label="ID ou link da MangaDex"
            labelPlacement="outside"
            placeholder="https://mangadex.org/title/e91dcdd1-005c-457d-a6c0-84f3fe22c1b0/the-main-heroines-are-trying-to-kill-me"
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
