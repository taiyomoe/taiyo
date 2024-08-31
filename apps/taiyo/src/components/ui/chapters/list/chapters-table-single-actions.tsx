import { Button } from "@nextui-org/button"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown"
import type { ChaptersListItem } from "@taiyomoe/types"
import { ChapterUtils } from "@taiyomoe/utils"
import { CopyIcon, EllipsisIcon, ExternalLinkIcon } from "lucide-react"
import Link from "next/link"
import type { Key } from "react"
import { useCopyToClipboard } from "usehooks-ts"

type Props = {
  chapter: ChaptersListItem
}

export const ChaptersTableSingleActions = ({ chapter }: Props) => {
  // const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [, copy] = useCopyToClipboard()

  const handleAction = (key: Key) => {
    switch (key) {
      case "copyId":
        copy(chapter.id)
        break
      case "copyUserId":
        copy(chapter.uploader.id)
        break
      case "copyMediaId":
        copy(chapter.media.id)
        break
      // case "delete":
      //   onOpen()
      //   break
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
            key="copyUserId"
            className="gap-6"
            endContent={<CopyIcon size={18} />}
          >
            Copiar ID do uploader
          </DropdownItem>
          <DropdownItem key="copyMediaId" endContent={<CopyIcon size={18} />}>
            Copiar ID da obra
          </DropdownItem>
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
          {/* <DropdownItem
            key="delete"
            endContent={<Trash2Icon size={18} />}
            color="danger"
          >
            Deletar
          </DropdownItem> */}
        </DropdownMenu>
      </Dropdown>
      {/* <ScansTableDeleteModal
        selectedScans={[scan]}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      /> */}
    </div>
  )
}
