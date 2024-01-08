import { Button } from "@nextui-org/button"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown"
import { Selection } from "@nextui-org/react"
import { useCallback, useMemo, useState } from "react"
import { DATERANGES_PT } from "~/lib/i18n/dateRanges"
import { DateRangeKey } from "~/lib/types"
import { SelectUtils } from "~/lib/utils/select.utils"

type Props = {
  onChange: (newKey: DateRangeKey) => void
}

export const DateRangeDropdown = ({ onChange }: Props) => {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(
    new Set(["lastWeek"]),
  )
  const selectedValue = useMemo(
    () => SelectUtils.getSelectedKey<DateRangeKey>(selectedKeys),
    [selectedKeys],
  )

  const handleChange = useCallback(
    (newKey: Selection) => {
      setSelectedKeys(newKey)
      onChange(SelectUtils.getSelectedKey(newKey))
    },
    [onChange],
  )

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button>{DATERANGES_PT[selectedValue]}</Button>
      </DropdownTrigger>
      <DropdownMenu
        selectionMode="single"
        selectedKeys={selectedKeys}
        onSelectionChange={handleChange}
        aria-label="Date range"
        disallowEmptySelection
      >
        {Object.entries(DATERANGES_PT).map(([key, value]) => (
          <DropdownItem key={key}>{value}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}
