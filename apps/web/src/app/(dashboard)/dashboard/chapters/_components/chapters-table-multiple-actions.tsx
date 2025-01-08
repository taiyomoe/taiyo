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
import { type Key, useMemo, useState } from "react"
import { useDataTable } from "~/components/generics/data-table/data-table-context"
import { ChaptersTableMutateModal } from "./chapters-table-mutate-modal"

export const ChaptersTableMultipleActions = () => {
  const mutateModal = useDisclosure()
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
      <ChaptersTableMutateModal type={type} {...mutateModal} />
    </>
  )
}
