import { Button } from "@nextui-org/button"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal"
import { TrashIcon } from "lucide-react"

import type { UserLibraryMedia } from "@taiyomoe/types"
import { api } from "~/lib/trpc/client"
import { useLibraryStore } from "~/stores"

type Props = {
  media: UserLibraryMedia
}

export const UserLibrarySidebarDeleteButton = ({ media }: Props) => {
  const { updateEntry } = useLibraryStore()
  const { mutate } = api.libary.updateLibrary.useMutation()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const handleDelete = () => {
    mutate({ mediaId: media.id, status: "delete" })
    updateEntry(media, "delete")
    onOpenChange()
  }

  return (
    <>
      <Button
        startContent={<TrashIcon />}
        onPress={onOpen}
        color="danger"
        variant="light"
        isIconOnly
      />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>Excluir</ModalHeader>
          <ModalBody>
            <p>
              Deseja realmente excluir{" "}
              <span className="font-semibold">{media.mainTitle}</span> da sua
              biblioteca?
            </p>
            <p>
              Você <span className="font-semibold">NÃO</span> perderá o
              histórico de leitura.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onOpenChange}>
              Não
            </Button>
            <Button color="danger" onClick={handleDelete}>
              Sim, excluir
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
