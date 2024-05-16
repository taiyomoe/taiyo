import { typeboxResolver } from "@hookform/resolvers/typebox"
import {
  type ImportMediaInput,
  importMediaSchema,
} from "@taiyomoe/image-orchestrator"
import { useSetAtom } from "jotai"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { importMediaEventMessagesAtom } from "~/atoms/wsEvents.atoms"
import { SubmitButton } from "~/components/generics/buttons/new-submit-button"
import { InputField } from "~/components/generics/newForm/input-field"
import { Form } from "~/components/generics/newForm/new-form"
import { ioApi } from "~/eden/client"

type Props = {
  onSubmit: () => void
}

export const ImportMediaForm = ({ onSubmit }: Props) => {
  const setMessages = useSetAtom(importMediaEventMessagesAtom)
  const methods = useForm<ImportMediaInput>({
    resolver: typeboxResolver(importMediaSchema),
    defaultValues: { mdId: "" },
    mode: "onTouched",
  })

  const handleSubmit: SubmitHandler<ImportMediaInput> = async (values) => {
    await ioApi.medias.import(values, {
      onMessage: (msg) => {
        console.log("msg", msg)
        setMessages((prev) => prev.concat(msg))
      },
      onOpen: () => {
        onSubmit()
      },
      onClose: () => {
        toast.success("Obra importada com sucesso.")
      },
      onError: () => {
        toast.error("Erro ao importar a obra.")
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
