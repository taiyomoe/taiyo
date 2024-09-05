import { Button } from "@nextui-org/button"
import { useDisclosure } from "@nextui-org/modal"
import { Trash2Icon } from "lucide-react"
import { ChaptersTableDeleteModal } from "./chapters-table-delete-modal"

export const ChaptersTableMultipleActions = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  return (
    <>
      <Button color="danger" variant="light" onPress={onOpen} isIconOnly>
        <Trash2Icon />
      </Button>
      <ChaptersTableDeleteModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  )
}
