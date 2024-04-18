import { Button } from "@nextui-org/button"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal"
import { SearchIcon } from "lucide-react"
import { MediaSearchAutocomplete } from "~/components/navbar/search/MediaSearchAutocomplete"
import { cn } from "~/lib/utils/cn"

type Props = {
  className?: string
}

export const MediaSearchModal = ({ className }: Props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  return (
    <>
      <Button
        className={cn(className, "bg-transparent")}
        startContent={<SearchIcon />}
        onClick={onOpen}
        isIconOnly
      />
      <Modal
        className="border-0 bg-transparent"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top"
        hideCloseButton
      >
        <ModalContent className="m-4 p-4 shadow-none">
          <ModalHeader className="justify-center px-0 text-center font-bold text-4xl drop-shadow-accent">
            Pesquisar
          </ModalHeader>
          <ModalBody className="p-0">
            <MediaSearchAutocomplete
              href={(mediaId) => `/media/${mediaId}`}
              className="w-full"
              allowsCustomValue
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
