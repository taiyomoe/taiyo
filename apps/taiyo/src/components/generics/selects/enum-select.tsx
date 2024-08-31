import type { Selection, SharedSelection } from "@nextui-org/react"
import { Select, SelectItem, type SelectProps } from "@nextui-org/select"
import { useRef, useState } from "react"
import { SelectUtils } from "~/lib/utils/select.utils"

type Props = { items: Record<string, unknown> } & Omit<
  SelectProps,
  "items" | "aria-label" | "children"
>

export const EnumSelect = ({ items, onSelectionChange, ...props }: Props) => {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set())
  const previousItems = useRef(items)

  const handleSelectionChange = (keys: SharedSelection) => {
    onSelectionChange?.(keys)
    setSelectedKeys(keys)
  }

  if (items !== previousItems.current) {
    setSelectedKeys(new Set())
    previousItems.current = items
  }

  return (
    <Select
      items={SelectUtils.enumToItems(previousItems.current)}
      selectedKeys={selectedKeys}
      onSelectionChange={handleSelectionChange}
      aria-label="Select value"
      {...props}
    >
      {({ label, value }) => (
        <SelectItem key={value} value={value} textValue={label}>
          {label}
        </SelectItem>
      )}
    </Select>
  )
}
