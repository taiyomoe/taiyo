import { typeboxResolver } from "@hookform/resolvers/typebox"
import { Button } from "@nextui-org/button"
import {
  type SyncMediaInput,
  syncMediaSchema,
} from "@taiyomoe/image-orchestrator"
import { useQueryState } from "nuqs"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { SubmitButton } from "~/components/generics/buttons/submit-button"
import { Form } from "~/components/generics/form/form"
import { MediasField } from "~/components/generics/form/medias-field"
import { SwitchField } from "~/components/generics/form/switch-field"
import { ioApi } from "~/eden/client"
import { useSyncMediaStore } from "~/stores/syncMedia.store"

export const SyncMediaForm = () => {
  const [_, setMediaId] = useQueryState("mediaId")
  const methods = useForm<SyncMediaInput>({
    resolver: typeboxResolver(syncMediaSchema),
    defaultValues: {
      mediaId: "",
      downloadCovers: true,
      downloadChapters: true,
    },
    mode: "onTouched",
  })
  const { set, addMessage } = useSyncMediaStore()

  const handleReset = () => {
    methods.reset()
    setMediaId(null)
    set({ currentStep: 0, messages: [], error: null })
  }

  const handleSubmit: SubmitHandler<SyncMediaInput> = (values) => {
    return new Promise((resolve, reject) => {
      void ioApi.medias.sync(values, {
        onMessage: (m) => {
          addMessage(m)
          set({ currentStep: m.step })
        },
        onError: (content) => {
          toast.error(content)
          reject(content)
          set({ error: content })
        },
        onOpen: () => {
          set({ currentStep: 1 })
        },
        onClose: () => {
          toast.success("Obra importada com sucesso.")

          resolve(null)
          set({ currentStep: 100 })
        },
      })
    })
  }

  return (
    <Form.Component {...methods} onSubmit={handleSubmit} className="gap-6">
      <MediasField name="mediaId" labelPlacement="outside" isRequired />
      <div className="flex flex-col gap-6 md:flex-row">
        <SwitchField
          name="downloadCovers"
          label="Baixar e upar novas covers?"
          onValueChange={(isSelected) => set({ downloadCovers: isSelected })}
        />
        <SwitchField
          name="downloadChapters"
          label="Baixar e upar novos capítulos?"
          onValueChange={(isSelected) => set({ downloadChapters: isSelected })}
        />
      </div>
      <div className="flex gap-6 self-end">
        {methods.formState.isSubmitted && (
          <Button onPress={handleReset} variant="flat" color="danger">
            Resetar
          </Button>
        )}
        <SubmitButton>Sincronizar</SubmitButton>
      </div>
    </Form.Component>
  )
}
