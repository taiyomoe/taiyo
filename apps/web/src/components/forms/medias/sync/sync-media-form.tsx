"use client"

import { Divider } from "@heroui/divider"
import { zodResolver } from "@hookform/resolvers/zod"
import { type SyncMediaInput, syncMediaSchema } from "@taiyomoe/schemas"
import { useRouter } from "next/navigation"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { SubmitButton } from "~/components/generics/buttons/submit-button"
import { CheckboxField } from "~/components/generics/form/checkbox-field"
import { Form } from "~/components/generics/form/form"
import { MediasField } from "~/components/generics/form/medias-field"
import { useErrorHandler } from "~/hooks/useErrorHandler"
import { api } from "~/trpc/react"
import { SyncMediaFormWarning } from "./sync-media-form-warning"

export const SyncMediaForm = () => {
  const { mutateAsync } = api.medias.sync.useMutation()
  const { handleError } = useErrorHandler()
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
        error: handleError(
          "Ocorreu um erro inesperado ao sincronizar a obra.",
          reject,
        ),
      })
    })
  }

  return (
    <Form.Component {...methods} onSubmit={handleSubmit}>
      <SyncMediaFormWarning />
      <Form.Col>
        <Form.Row>
          <MediasField
            name="id"
            label="Obra"
            labelPlacement="outside"
            inputProps={{ classNames: { helperWrapper: "!hidden" } }}
            isRequired
          />
          <SubmitButton className="self-end">Sincronizar</SubmitButton>
        </Form.Row>
        <div>
          <h5 className="text-default-400 text-sm">Opções</h5>
          <Divider className="mb-2 bg-default-300" />
          <div className="flex flex-col gap-2">
            <CheckboxField name="importCovers" label="Upar covers" />
            <CheckboxField name="importChapters" label="Upar capítulos" />
          </div>
        </div>
      </Form.Col>
    </Form.Component>
  )
}
