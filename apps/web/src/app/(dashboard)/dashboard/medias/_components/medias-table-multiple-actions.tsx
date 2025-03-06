import { Button } from "@heroui/button"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown"
import { useDisclosure } from "@heroui/modal"
import type { MediasListItem } from "@taiyomoe/types"
import { ArchiveRestoreIcon, EllipsisIcon, Trash2Icon } from "lucide-react"
import { type Key, useMemo, useState } from "react"
import { useDataTable } from "~/components/generics/data-table/data-table-context"
import { MediasTableMutateModal } from "./medias-table-mutate-modal"

export const MediasTableMultipleActions = () => {
  const mutateModal = useDisclosure()
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
  const [type, setType] = useState<"delete" | "restore">("delete")

  const handleAction = (key: Key) => {
    mutateModal.onOpen()
    setType(key as "delete" | "restore")
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
      <MediasTableMutateModal type={type} {...mutateModal} />
    </>
  )
}
