import { Button } from "@nextui-org/button"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown"
import type { ScansList } from "@taiyomoe/types"
import { CopyIcon, EllipsisIcon, ExternalLinkIcon } from "lucide-react"
import Link from "next/link"
import type { Key } from "react"
import { useCopyToClipboard } from "usehooks-ts"

type Props = {
  scan: ScansList[number]
}
export const ScansTableSingleActions = ({ scan }: Props) => {
  const [, copy] = useCopyToClipboard()

  const handleAction = (key: Key) => {
    if (key !== "copyId") return

    copy(scan.id)
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
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}
