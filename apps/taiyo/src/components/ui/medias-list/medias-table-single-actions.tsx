import { Button } from "@nextui-org/button"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown"
import type { MediasListItem } from "@taiyomoe/types"
import { MediaUtils } from "@taiyomoe/utils"
import { EllipsisIcon, ExternalLinkIcon } from "lucide-react"
import Link from "next/link"

type Props = {
  media: MediasListItem
}

export const MediasTableSingleActions = ({ media }: Props) => (
  <div className="relative flex items-center justify-end gap-2">
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly size="sm" variant="light">
          <EllipsisIcon className="text-default-300" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu variant="flat">
        <DropdownItem
          as={Link}
          href={MediaUtils.getUrl(media)}
          endContent={<ExternalLinkIcon size={18} />}
          target="_blank"
        >
          Abrir a página da obra
        </DropdownItem>
        <DropdownItem
          as={Link}
          href={`/dashboard/medias/edit/${media.id}`}
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
