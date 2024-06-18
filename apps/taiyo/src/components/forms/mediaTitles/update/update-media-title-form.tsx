import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@nextui-org/button"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal"
import type { MediaTitle } from "@prisma/client"
import { type UpdateTitleInput, updateTitleSchema } from "@taiyomoe/schemas"
import { ObjectUtils } from "@taiyomoe/utils"
import { TRPCClientError } from "@trpc/client"
import { FileEditIcon } from "lucide-react"
import { pick } from "radash"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { DeleteMediaTitleButton } from "~/components/forms/mediaTitles/delete-media-title-button"
import { MediaTitleFormFields } from "~/components/forms/mediaTitles/media-title-form-fields"
import { SubmitButton } from "~/components/generics/buttons/submit-button"
import { Form } from "~/components/generics/form/form"
import { useMediaUpdateStore } from "~/stores"
import { api } from "~/trpc/react"

type Props = {
  title: MediaTitle
}

export const UpdateMediaTitleForm = ({ title }: Props) => {
  const { mutateAsync } = api.titles.update.useMutation()
  const initialValues = pick(title, [
    "id",
    "title",
    "language",
    "priority",
    "isMainTitle",
    "isAcronym",
  ])
  const methods = useForm<UpdateTitleInput>({
    resolver: zodResolver(updateTitleSchema),
    defaultValues: initialValues,
    mode: "onTouched",
  })
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { updateTitle } = useMediaUpdateStore()

  const handleSubmit: SubmitHandler<UpdateTitleInput> = (values) => {
    const delta = ObjectUtils.deepDiff(values, initialValues)
    const payload = {
      id: values.id,
      ...delta,
    }

    toast.promise(mutateAsync(payload), {
      loading: "Salvando alterações...",
      success: () => {
        updateTitle(payload)
        onOpen()
        onOpenChange()
        methods.reset(values)

        return "Alterações salvas com sucesso!"
      },
      error: (err) => {
        if (err instanceof TRPCClientError) {
          return err.message
        }

        return "Ocorreu um erro inesperado ao salvar as alterações."
      },
    })
  }

  return (
    <>
      <Button
        startContent={<FileEditIcon className="h-6 w-6" />}
        onPress={onOpen}
        color="warning"
        variant="light"
        size="sm"
        isIconOnly
      />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <Form.Component {...methods} onSubmit={handleSubmit}>
          <ModalContent>
            <ModalHeader>Modificar título</ModalHeader>
            <ModalBody>
              <MediaTitleFormFields />
            </ModalBody>
            <ModalFooter>
              <DeleteMediaTitleButton toggleModal={onOpen} />
              <Button onClick={onOpenChange}>Fechar</Button>
              <SubmitButton>Salvar</SubmitButton>
            </ModalFooter>
          </ModalContent>
        </Form.Component>
      </Modal>
    </>
  )
}
