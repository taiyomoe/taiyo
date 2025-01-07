import { Button } from "@nextui-org/button"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown"
import type { ChaptersListItem } from "@taiyomoe/types"
import { ChapterUtils } from "@taiyomoe/utils"
import { EllipsisIcon, ExternalLinkIcon } from "lucide-react"
import Link from "next/link"

type Props = {
  chapter: ChaptersListItem
}

export const ChaptersTableSingleActions = ({ chapter }: Props) => (
  <div className="relative flex items-center justify-end gap-2">
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly size="sm" variant="light">
          <EllipsisIcon className="text-default-300" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu variant="flat">
        <DropdownItem
          key="go"
          as={Link}
          href={ChapterUtils.getUrl(chapter)}
          endContent={<ExternalLinkIcon size={18} />}
          target="_blank"
        >
          Abrir o capítulo
        </DropdownItem>
        <DropdownItem
          key="edit"
          as={Link}
          href={`/dashboard/chapters/edit/${chapter.id}`}
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
