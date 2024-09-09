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
import { BulkUploadInvalidFilesShowcase } from "~/components/ui/bulk-upload/bulk-upload-invalid-files-showcase"
import type { InvalidFile } from "~/lib/types"

type Props = {
  files: InvalidFile[]
  onDismiss: () => void
}

export const BulkUploadInvalidFilesModal = ({ files, onDismiss }: Props) => {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()

  const handleClose = useCallback(() => {
    onClose()
    onDismiss()
  }, [onClose, onDismiss])

  const handleDismiss = useCallback(() => {
    onOpenChange()
    onDismiss()
  }, [onOpenChange, onDismiss])

  useEffect(() => {
    if (files.length) {
      onOpen()
    }
  }, [files, onOpen])

  return (
    <Modal isOpen={isOpen} onOpenChange={handleDismiss} scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Ficheiros inválidos
        </ModalHeader>
        <ModalBody className="scrollbar-thin scrollbar-track-content2">
          <BulkUploadInvalidFilesShowcase files={files} />
        </ModalBody>
        <ModalFooter>
          <Button onPress={handleClose} variant="light">
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
