import { Button } from "@nextui-org/button"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown"
import { useDisclosure } from "@nextui-org/modal"
import type { MediasListItem } from "@taiyomoe/types"
import { ArchiveRestoreIcon, EllipsisIcon, Trash2Icon } from "lucide-react"
import { type Key, useMemo } from "react"
import { useDataTable } from "~/components/generics/data-table/data-table-context"
import { MediasTableDeleteModal } from "./medias-table-delete-modal"
import { MediasTableRestoreModal } from "./medias-table-restore-modal"

export const MediasTableMultipleActions = () => {
  const restoreModal = useDisclosure()
  const deleteModal = useDisclosure()
  const table = useDataTable<MediasListItem>()
  const selectedDeletedMediasCount = table
    .getSelectedRowModel()
    .rows.filter((r) => r.original.deletedAt !== null).length
  const selectedMediasCount =
    table.getSelectedRowModel().rows.length - selectedDeletedMediasCount
  const disabledKeys = useMemo(() => {
    const keys: string[] = []
    if (selectedMediasCount === 0) keys.push("delete")
    if (selectedDeletedMediasCount === 0) keys.push("restore")
    return keys
  }, [selectedMediasCount, selectedDeletedMediasCount])

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
            Restaurar ({selectedDeletedMediasCount})
          </DropdownItem>
          <DropdownItem
            key="delete"
            color="danger"
            endContent={<Trash2Icon size={18} />}
            textValue="Deletar"
          >
            Deletar ({selectedMediasCount})
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <MediasTableRestoreModal {...restoreModal} />
      <MediasTableDeleteModal {...deleteModal} />
    </>
  )
}
