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
  defaultChoice: number
  choices: number[]
  renderOption: (option: number) => string
  onChange: (newPerPage: number) => void
}

export const PerPageDropdown = ({
  defaultChoice,
  choices,
  renderOption,
  onChange,
}: Props) => {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(
    new Set([defaultChoice]),
  )

  const handleSelectionChange = (keys: Selection) => {
    const newPerPage = Array.from(keys).join()

    setSelectedKeys(keys)
    onChange(Number.parseInt(newPerPage))
  }

  return (
    <Dropdown classNames={{ content: "min-w-fit" }} radius="sm">
      <DropdownTrigger>
        <Button
          className="h-9 w-fit min-w-fit justify-between gap-1 px-3"
          endContent={<ChevronDownIcon size={16} />}
          radius="sm"
        >
          {Array.from(selectedKeys).join()}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
        aria-label="Capítulos por página"
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
