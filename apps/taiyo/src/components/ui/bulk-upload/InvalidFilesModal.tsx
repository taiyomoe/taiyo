import { Button } from "@nextui-org/button"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal"
import { useCallback, useEffect } from "react"
import { InvalidFilesShowcase } from "~/components/ui/bulk-upload/InvalidFilesShowcase"
import type { InvalidFile } from "~/lib/types"

type Props = {
  files: InvalidFile[]
  reset: () => void
}

export const InvalidFilesModal = ({ files, reset }: Props) => {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()

  const handleClose = useCallback(() => {
    onClose()
    reset()
  }, [onClose, reset])

  const handleDismiss = useCallback(() => {
    onOpenChange()
    reset()
  }, [onOpenChange, reset])

  useEffect(() => {
    if (files.length) {
      onOpen()
    }
  }, [files, onOpen])

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={handleDismiss}
      scrollBehavior="inside"
      // size="xl"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Ficheiros inválidos
        </ModalHeader>
        <ModalBody className="scrollbar-thin scrollbar-track-content2">
          <InvalidFilesShowcase files={files} />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" variant="light" onPress={handleClose}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
