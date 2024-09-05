import { Button } from "@nextui-org/button"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal"
import type { MediaLimitedChapter } from "@taiyomoe/types"
import { TrashIcon } from "lucide-react"
import { toast } from "sonner"
import { api } from "~/trpc/react"

type Props = {
  chapter: MediaLimitedChapter
}

export const DeleteChapterButton = ({ chapter }: Props) => {
  const { mutateAsync } = api.chapters.bulkDelete.useMutation()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  const apiUtils = api.useUtils()

  const handleDelete = () => {
    toast.promise(mutateAsync([chapter.id]), {
      loading: "Apagando o capítulo...",
      success: () => {
        onOpenChange()
        void apiUtils.chapters.getByMediaId.invalidate()

        return "Capítulo apagado com sucesso!"
      },
      error: (error) => {
        console.error(error)

        return "Erro ao apagar o capítulo."
      },
    })
  }

  return (
    <>
      <Button
        startContent={<TrashIcon size={18} />}
        onPress={onOpen}
        size="sm"
        variant="light"
        color="danger"
        isIconOnly
      />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>Excluir</ModalHeader>
          <ModalBody>
            <p>
              Deseja realmente excluir o capítulo{" "}
              <span className="font-semibold text-warning">
                {chapter.number}
              </span>
              ?
            </p>
            <p>
              Esta ação{" "}
              <span className="font-semibold text-warning">PODERÁ</span> ser
              revertida posteriormente, no entanto todos os históricos de
              leitura deste capítulo serão perdidos.
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
