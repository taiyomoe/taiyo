import { typeboxResolver } from "@hookform/resolvers/typebox"
import {
  type ImportMediaInput,
  importMediaSchema,
} from "@taiyomoe/image-orchestrator"
import { useSetAtom } from "jotai"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  importMediaCurrentStepAtom,
  importMediaMessagesAtom,
} from "~/atoms/importMedia.atoms"
import { SubmitButton } from "~/components/generics/buttons/new-submit-button"
import { InputField } from "~/components/generics/newForm/input-field"
import { Form } from "~/components/generics/newForm/new-form"
import { ioApi } from "~/eden/client"

export const ImportMediaForm = () => {
  const methods = useForm<ImportMediaInput>({
    resolver: typeboxResolver(importMediaSchema),
    defaultValues: { mdId: "" },
    mode: "onTouched",
  })
  const setCurrentStep = useSetAtom(importMediaCurrentStepAtom)
  const setMessages = useSetAtom(importMediaMessagesAtom)

  const handleSubmit: SubmitHandler<ImportMediaInput> = async (values) => {
    await ioApi.medias.import(values, {
      onMessage: (msg) => {
        setMessages((prev) => ({
          ...prev,
          [msg.step]: (prev[msg.step] ?? []).concat(msg),
        }))
        setCurrentStep(msg.step)
      },
      onOpen: () => {
        setCurrentStep(1)
      },
      onClose: () => {
        toast.success("Obra importada com sucesso.")
        setCurrentStep(5)
      },
    })
  }

  return (
    <Form.Component {...methods} onSubmit={handleSubmit} className="gap-4">
      <div className="flex gap-4">
        <InputField
          name="mdId"
          placeholder="93c8f7f8-58cc-40fe-9146-3f68cbfc71af"
        />
        <SubmitButton>Importar</SubmitButton>
      </div>
    </Form.Component>
  )
}
