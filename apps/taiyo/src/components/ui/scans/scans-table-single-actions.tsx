import { Button } from "@nextui-org/button"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown"
import { useDisclosure } from "@nextui-org/react"
import type { ScansListItem } from "@taiyomoe/types"
import {
  CopyIcon,
  EllipsisIcon,
  ExternalLinkIcon,
  Trash2Icon,
} from "lucide-react"
import Link from "next/link"
import type { Key } from "react"
import { useCopyToClipboard } from "usehooks-ts"
import { ScansTableDeleteModal } from "./scans-table-delete-modal"

type Props = {
  scan: ScansListItem
}
export const ScansTableSingleActions = ({ scan }: Props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [, copy] = useCopyToClipboard()

  const handleAction = (key: Key) => {
    switch (key) {
      case "copyId":
        copy(scan.id)
        break
      case "delete":
        onOpen()
        break
    }
  }

  return (
    <div className="relative flex items-center justify-end gap-2">
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly size="sm" variant="light">
            <EllipsisIcon className="text-default-300" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu variant="flat" onAction={handleAction}>
          <DropdownItem key="copyId" endContent={<CopyIcon size={18} />}>
            Copiar ID
          </DropdownItem>
          <DropdownItem
            key="edit"
            as={Link}
            href={`/dashboard/scans/edit/${scan.id}`}
            endContent={<ExternalLinkIcon size={18} />}
            color="warning"
            target="_blank"
          >
            Modificar
          </DropdownItem>
          <DropdownItem
            key="delete"
            endContent={<Trash2Icon size={18} />}
            color="danger"
          >
            Deletar
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <ScansTableDeleteModal
        selectedScans={[scan]}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      />
    </div>
  )
}
