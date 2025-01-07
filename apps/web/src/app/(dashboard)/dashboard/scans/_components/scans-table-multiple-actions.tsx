import { Button } from "@nextui-org/button"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown"
import { useDisclosure } from "@nextui-org/modal"
import type { ScansListItem } from "@taiyomoe/types"
import { ArchiveRestoreIcon, EllipsisIcon, Trash2Icon } from "lucide-react"
import { type Key, useMemo, useState } from "react"
import { useDataTable } from "~/components/generics/data-table/data-table-context"
import { ScansTableMutateModal } from "./scans-table-mutate-modal"

export const ScansTableMultipleActions = () => {
  const mutateModal = useDisclosure()
  const table = useDataTable<ScansListItem>()
  const selectedDeletedScansCount = table
    .getSelectedRowModel()
    .rows.filter((r) => r.original.deletedAt !== null).length
  const selectedScansCount =
    table.getSelectedRowModel().rows.length - selectedDeletedScansCount
  const disabledKeys = useMemo(() => {
    const keys: string[] = []
    if (selectedScansCount === 0) keys.push("delete")
    if (selectedDeletedScansCount === 0) keys.push("restore")
    return keys
  }, [selectedScansCount, selectedDeletedScansCount])
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
            Restaurar ({selectedDeletedScansCount})
          </DropdownItem>
          <DropdownItem
            key="delete"
            color="danger"
            endContent={<Trash2Icon size={18} />}
            textValue="Deletar"
          >
            Deletar ({selectedScansCount})
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <ScansTableMutateModal type={type} {...mutateModal} />
    </>
  )
}
