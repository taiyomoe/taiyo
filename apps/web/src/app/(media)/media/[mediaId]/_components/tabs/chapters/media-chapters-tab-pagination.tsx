import { Button } from "@heroui/button"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown"
import { Pagination } from "@heroui/pagination"
import type { Selection } from "@heroui/react"
import { tv } from "@heroui/react"
import { MEDIA_PER_PAGE_CHOICES } from "@taiyomoe/constants"
import { ChevronDownIcon } from "lucide-react"
import { useState } from "react"
import { useMediaNavigation } from "~/hooks/useMediaNavigation"

type Props = {
  totalPages: number
}

const mediaChaptersTabPagination = tv({
  slots: {
    container: "flex justify-end gap-4",
    dropdownContent: "min-w-fit",
    triggerButton: "h-9 w-fit min-w-fit justify-between px-2",
  },
})

export const MediaChaptersTabPagination = ({ totalPages }: Props) => {
  const { container, dropdownContent, triggerButton } =
    mediaChaptersTabPagination()

  const { page, perPage, setPage, handlePerPageChange } = useMediaNavigation()
  const [selectedKeys, setSelectedKeys] = useState<Selection>(
    new Set([perPage]),
  )

  const handleSelectionChange = (keys: Selection) => {
    const newPerPage = Array.from(keys).join(", ").replaceAll("_", " ")

    setSelectedKeys(keys)
    void handlePerPageChange(Number.parseInt(newPerPage))
  }

  return (
    <div className={container()}>
      <Dropdown classNames={{ content: dropdownContent() }} radius="sm">
        <DropdownTrigger>
          <Button
            className={triggerButton()}
            endContent={<ChevronDownIcon size={16} />}
            radius="sm"
          >
            {perPage}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={selectedKeys}
          onSelectionChange={handleSelectionChange}
          aria-label="Capítulos por página"
        >
          {MEDIA_PER_PAGE_CHOICES.map((option) => (
            <DropdownItem key={option} textValue={`${option} caps.`}>
              {option} caps.
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      <Pagination
        total={totalPages}
        initialPage={page}
        page={page}
        onChange={setPage}
        color="primary"
        radius="sm"
        isDisabled={totalPages === 1}
      />
    </div>
  )
}
