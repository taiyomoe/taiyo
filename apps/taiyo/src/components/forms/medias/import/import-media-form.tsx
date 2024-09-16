import { typeboxResolver } from "@hookform/resolvers/typebox"
import { Button } from "@nextui-org/button"
import {
  type ImportMediaInput,
  importMediaSchema,
} from "@taiyomoe/image-orchestrator"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { SubmitButton } from "~/components/generics/buttons/submit-button"
import { Form } from "~/components/generics/form/form"
import { InputField } from "~/components/generics/form/input-field"
import { SwitchField } from "~/components/generics/form/switch-field"
import { ioApi } from "~/eden/client"
import { useImportMediaStore } from "~/stores/importMedia.store"

export const ImportMediaForm = () => {
  const methods = useForm<ImportMediaInput>({
    resolver: typeboxResolver(importMediaSchema),
    defaultValues: { mdId: "", downloadChapters: true },
    mode: "onTouched",
  })
  const { set, addMessage } = useImportMediaStore()

  const handleReset = () => {
    methods.reset()
    set({ currentStep: 0, messages: [], error: null })
  }

  const handleSubmit: SubmitHandler<ImportMediaInput> = async (values) => {
    return new Promise((resolve, reject) => {
      void ioApi.medias.import(values, {
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
    <Form.Component
      {...methods}
      onSubmit={handleSubmit}
      className="gap-4 md:flex-row md:items-end"
    >
      <InputField
        name="mdId"
        placeholder="93c8f7f8-58cc-40fe-9146-3f68cbfc71af"
      />
      <SwitchField
        name="downloadChapters"
        label="Baixar e upar os capítulos?"
        onValueChange={(isSelected) => set({ downloadChapters: isSelected })}
      />
      <div className="flex gap-6 self-end">
        {methods.formState.isSubmitted && (
          <Button onPress={handleReset} variant="flat" color="danger">
            Resetar
          </Button>
        )}
        <SubmitButton>Importar</SubmitButton>
      </div>
    </Form.Component>
  )
}
