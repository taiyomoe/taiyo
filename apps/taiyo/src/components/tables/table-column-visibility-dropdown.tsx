import { Button } from "@nextui-org/button"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown"
import type { Table } from "@tanstack/react-table"
import { ChevronDownIcon } from "lucide-react"

type Props<TData> = {
  table: Table<TData>
}

export const TableColumnVisibilityDropdown = <TData,>({
  table,
}: Props<TData>) => {
  const visibleColumns = table.getAllColumns().filter((c) => c.getIsVisible())
  const hideableColumns = table.getAllColumns().filter((c) => c.getCanHide())

  return (
    <Dropdown>
      <DropdownTrigger className="flex">
        <Button endContent={<ChevronDownIcon size={16} />} variant="flat">
          Colunas
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        selectedKeys={visibleColumns.map((c) => c.id)}
        selectionMode="multiple"
        closeOnSelect={false}
        disallowEmptySelection
        aria-label="Table columns"
      >
        {hideableColumns.map((c) => (
          <DropdownItem
            key={c.id}
            onClick={() => c.toggleVisibility()}
            className="[&_svg]:text-primary"
          >
            {c.columnDef.header?.toString() || c.id}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}
