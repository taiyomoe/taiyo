import { Button } from "@nextui-org/button"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown"
import type { Selection } from "@nextui-org/react"
import { ChevronDownIcon } from "lucide-react"
import { useState } from "react"

type Props = {
  perPage: number
  choices: number[]
  isLoading: boolean
  renderOption: (option: number) => string
  onChange: (newPerPage: number) => void
}

export const PerPageDropdown = ({
  perPage,
  choices,
  isLoading,
  renderOption,
  onChange,
}: Props) => {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(
    new Set([perPage.toString()]),
  )

  const handleSelectionChange = (keys: Selection) => {
    const newPerPage = Array.from(keys).join()

    setSelectedKeys(keys)
    onChange(Number.parseInt(newPerPage))
  }

  return (
    <Dropdown
      classNames={{ content: "min-w-fit" }}
      radius="sm"
      isDisabled={isLoading}
    >
      <DropdownTrigger>
        <Button
          className="h-9 w-fit min-w-fit justify-between gap-1 px-3"
          endContent={<ChevronDownIcon size={16} />}
          variant="flat"
          radius="sm"
        >
          {Array.from(selectedKeys).join()}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        selectionMode="single"
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
        aria-label="Capítulos por página"
        disallowEmptySelection
      >
        {choices.map((option) => {
          const rendered = renderOption(option)

          return (
            <DropdownItem key={option} textValue={rendered}>
              {rendered}
            </DropdownItem>
          )
        })}
      </DropdownMenu>
    </Dropdown>
  )
}
