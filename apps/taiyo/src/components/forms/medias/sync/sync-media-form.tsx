"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { type SyncMediaInput, syncMediaSchema } from "@taiyomoe/schemas"
import { useRouter } from "next/navigation"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { SubmitButton } from "~/components/generics/buttons/submit-button"
import { Form } from "~/components/generics/form/form"
import { MediasField } from "~/components/generics/form/medias-field"
import { SwitchField } from "~/components/generics/form/switch-field"
import { api } from "~/trpc/react"

export const SyncMediaForm = () => {
  const { mutateAsync } = api.medias.sync.useMutation()
  const methods = useForm<SyncMediaInput>({
    resolver: zodResolver(syncMediaSchema),
    mode: "onTouched",
    defaultValues: {
      id: "",
      importCovers: true,
      importChapters: true,
    },
  })
  const router = useRouter()

  const handleSubmit: SubmitHandler<SyncMediaInput> = (values) => {
    return new Promise((resolve, reject) => {
      toast.promise(mutateAsync(values), {
        loading: "Sincronizando...",
        success: (data) => {
          methods.reset()
          router.push(`/dashboard/sessions/${data.sessionId}`)
          resolve(data)

          return "Informações sincronizadas com sucesso! Upload de covers e capítulos em andamento..."
        },
        error: () => {
          reject()

          return "Ocorreu um erro inesperado ao sincronizar a obra."
        },
      })
    })
  }

  return (
    <Form.Component {...methods} onSubmit={handleSubmit}>
      <Form.Col>
        <Form.Row>
          <MediasField
            name="id"
            label="Obra"
            labelPlacement="outside"
            isRequired
          />
          <SubmitButton className="self-end">Sincronizar</SubmitButton>
        </Form.Row>
        <Form.Row>
          <SwitchField name="importCovers" label="Baixar e upar covers?" />
          <SwitchField name="importChapters" label="Baixar e upar capítulos?" />
        </Form.Row>
      </Form.Col>
    </Form.Component>
  )
}
