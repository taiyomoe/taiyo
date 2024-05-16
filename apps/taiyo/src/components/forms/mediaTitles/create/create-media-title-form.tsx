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
import type { CreateMediaTitleInput } from "@taiyomoe/schemas"
import { createMediaTitleSchema } from "@taiyomoe/schemas"
import { TRPCClientError } from "@trpc/client"
import { PlusIcon } from "lucide-react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { MediaTitleFormFields } from "~/components/forms/mediaTitles/media-title-form-fields"
import { SubmitButton } from "~/components/generics/buttons/submit-button"
import { Form } from "~/components/generics/form/new-form"
import { useMediaUpdateStore } from "~/stores"
import { api } from "~/trpc/react"

type Props = {
  mediaId: string
}

export const CreateMediaTitleForm = ({ mediaId }: Props) => {
  const { mutateAsync } = api.mediaTitles.create.useMutation()
  const initialValues: CreateMediaTitleInput = {
    title: "",
    language: "ja",
    priority: 1,
    isMainTitle: false,
    isAcronym: false,
    mediaId,
  }
  const methods = useForm<CreateMediaTitleInput>({
    resolver: zodResolver(createMediaTitleSchema),
    defaultValues: initialValues,
    mode: "onTouched",
  })
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { addTitle } = useMediaUpdateStore()

  const handleSubmit: SubmitHandler<CreateMediaTitleInput> = (values) => {
    toast.promise(mutateAsync(values), {
      loading: "Criando título...",
      success: (createdTitle) => {
        onOpenChange()
        addTitle(createdTitle)

        return "Título criado com sucesso."
      },
      error: (err) => {
        if (err instanceof TRPCClientError) {
          return err.message
        }

        return "Ocorreu um erro inesperado ao criar o título."
      },
    })
  }

  return (
    <>
      <Button
        startContent={<PlusIcon className="h-6 w-6" />}
        onPress={onOpen}
        color="primary"
        variant="light"
        size="sm"
        isIconOnly
      />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <Form.Component {...methods} onSubmit={handleSubmit}>
          <ModalContent>
            <ModalHeader>Criar título</ModalHeader>
            <ModalBody>
              <MediaTitleFormFields />
            </ModalBody>
            <ModalFooter>
              <Button onClick={onOpenChange}>Fechar</Button>
              <SubmitButton>Criar</SubmitButton>
            </ModalFooter>
          </ModalContent>
        </Form.Component>
      </Modal>
    </>
  )
}
