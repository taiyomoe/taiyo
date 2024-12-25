import { Button } from "@nextui-org/button"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown"
import type { ScansListItem } from "@taiyomoe/types"
import { EllipsisIcon, ExternalLinkIcon } from "lucide-react"
import Link from "next/link"

type Props = {
  scan: ScansListItem
}

export const ScansTableSingleActions = ({ scan }: Props) => (
  <div className="relative flex items-center justify-end gap-2">
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly size="sm" variant="light">
          <EllipsisIcon className="text-default-300" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu variant="flat">
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
