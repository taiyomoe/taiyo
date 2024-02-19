import { Button } from "@nextui-org/button"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal"
import { TRPCClientError } from "@trpc/client"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"
import { toFormikValidationSchema } from "zod-formik-adapter"

import type { FormSubmit } from "@taiyomoe/types"
import { MediaTitlesFormFields } from "~/components/forms/mediaTitles/MediaTitlesFormFields"
import { SubmitButton } from "~/components/generics/buttons/SubmitButton"
import { Form } from "~/components/generics/form/Form"
import type { CreateMediaTitleSchema } from "~/lib/schemas"
import { createMediaTitleSchema } from "~/lib/schemas"
import { api } from "~/lib/trpc/client"
import { useMediaUpdateStore } from "~/stores"

type Props = {
  mediaId: string
}

export const UpdateMediaTitleCreateButton = ({ mediaId }: Props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { mutateAsync } = api.mediaTitles.create.useMutation()
  const { addTitle } = useMediaUpdateStore()

  const initialValues: CreateMediaTitleSchema = {
    title: "",
    language: "ja",
    priority: 1,
    isMainTitle: false,
    isAcronym: false,
    mediaId,
  }

  const handleSubmit: FormSubmit<CreateMediaTitleSchema> = (values, helper) => {
    const { setSubmitting } = helper

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
      finally: () => {
        setSubmitting(false)
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
        <Form.Component
          initialValues={initialValues}
          validationSchema={toFormikValidationSchema(createMediaTitleSchema)}
          onSubmit={handleSubmit}
        >
          <ModalContent>
            <ModalHeader>Criar título</ModalHeader>
            <ModalBody>
              <MediaTitlesFormFields initialValues={initialValues} />
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
