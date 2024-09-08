import { Button } from "@nextui-org/button"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown"
import { useDisclosure } from "@nextui-org/modal"
import type { ChaptersListItem } from "@taiyomoe/types"
import { ArchiveRestoreIcon, EllipsisIcon, Trash2Icon } from "lucide-react"
import { type Key, useMemo } from "react"
import { useDataTable } from "~/components/generics/data-table/data-table-context"
import { ChaptersTableRestoreModal } from "~/components/ui/chapters/list/chapters-table-restore-modal"
import { ChaptersTableDeleteModal } from "./chapters-table-delete-modal"

export const ChaptersTableMultipleActions = () => {
  const restoreModal = useDisclosure()
  const deleteModal = useDisclosure()
  const table = useDataTable<ChaptersListItem>()
  const selectedDeletedChaptersCount = table
    .getSelectedRowModel()
    .rows.filter((r) => r.original.deletedAt !== null).length
  const selectedChaptersCount =
    table.getSelectedRowModel().rows.length - selectedDeletedChaptersCount
  const disabledKeys = useMemo(() => {
    const keys: string[] = []
    if (selectedChaptersCount === 0) keys.push("delete")
    if (selectedDeletedChaptersCount === 0) keys.push("restore")
    return keys
  }, [selectedChaptersCount, selectedDeletedChaptersCount])

  const handleAction = (key: Key) => {
    switch (key) {
      case "restore":
        restoreModal.onOpen()
        break
      case "delete":
        deleteModal.onOpen()
        break
    }
  }

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button variant="light" isIconOnly>
            <EllipsisIcon className="text-default-300" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          onAction={handleAction}
          variant="flat"
          disabledKeys={disabledKeys}
        >
          <DropdownItem
            key="restore"
            color="warning"
            endContent={<ArchiveRestoreIcon size={18} />}
            textValue="Restaurar"
          >
            Restaurar ({selectedDeletedChaptersCount})
          </DropdownItem>
          <DropdownItem
            key="delete"
            color="danger"
            endContent={<Trash2Icon size={18} />}
            textValue="Deletar"
          >
            Deletar ({selectedChaptersCount})
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <ChaptersTableRestoreModal {...restoreModal} />
      <ChaptersTableDeleteModal {...deleteModal} />
    </>
  )
}
