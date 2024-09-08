import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@nextui-org/button"
import { Image } from "@nextui-org/image"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal"
import type { MediaCover } from "@taiyomoe/db"
import type { UpdateCoverInput } from "@taiyomoe/schemas"
import { updateCoverSchema } from "@taiyomoe/schemas"
import type { MediaWithRelations } from "@taiyomoe/types"
import { CoverUtils, ObjectUtils } from "@taiyomoe/utils"
import NextImage from "next/image"
import { pick } from "radash"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { DeleteCoverButton } from "~/components/forms/mediaCovers/delete-cover-button"
import { SubmitButton } from "~/components/generics/buttons/submit-button"
import { Form } from "~/components/generics/form/form"
import { MediaImage } from "~/components/images/MediaImage"
import { useMediaUpdateStore } from "~/stores"
import { api } from "~/trpc/react"
import { UpdateCoverFormFields } from "./update-cover-form-fields"

type Props = {
  media: MediaWithRelations
  cover: MediaCover
}

export const UpdateCoverForm = ({ media, cover }: Props) => {
  const { mutateAsync } = api.covers.update.useMutation()
  const initialValues = pick(cover, [
    "id",
    "volume",
    "contentRating",
    "isMainCover",
    "language",
  ])
  const methods = useForm<UpdateCoverInput>({
    resolver: zodResolver(updateCoverSchema),
    defaultValues: initialValues,
    mode: "onTouched",
  })
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { updateCover } = useMediaUpdateStore()

  const handleSubmit: SubmitHandler<UpdateCoverInput> = (values) => {
    const delta = ObjectUtils.deepDiff(values, initialValues)
    const payload = {
      id: values.id,
      ...delta,
    }

    toast.promise(mutateAsync(payload), {
      loading: "Salvando alterações...",
      success: () => {
        updateCover(payload)
        onOpenChange()
        methods.reset(values)

        return "Alterações salvas com sucesso!"
      },
      error: "Não foi possível salvar as alterações.",
    })
  }

  return (
    <>
      <Image
        as={NextImage}
        className="h-[300px] min-w-[210px] rounded-small object-cover transition-all hover:cursor-pointer hover:opacity-80"
        src={CoverUtils.getUrl({ id: media.id, coverId: cover.id })}
        onClick={onOpen}
        height={300}
        width={210}
        alt="cover"
      />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <Form.Component {...methods} onSubmit={handleSubmit}>
          <ModalContent>
            <ModalHeader>Modificar covar</ModalHeader>
            <ModalBody className="flex-row">
              <MediaImage
                src={CoverUtils.getUrl({
                  id: media.id,
                  coverId: cover.id,
                })}
                classNames={{
                  height: "min-h-[160px] h-[160px]",
                  width: "min-w-[110px] w-[110px]",
                }}
                maxHeight={160}
                maxWidth={110}
                alt="media's cover"
                radius="sm"
              />
              <UpdateCoverFormFields isMainCover={initialValues.isMainCover} />
            </ModalBody>
            <ModalFooter>
              <DeleteCoverButton toggleModal={onOpen} />
              <Button onClick={onOpenChange}>Fechar</Button>
              <SubmitButton>Salvar</SubmitButton>
            </ModalFooter>
          </ModalContent>
        </Form.Component>
      </Modal>
    </>
  )
}
