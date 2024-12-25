import { Button } from "@nextui-org/button"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown"
import { ArrowLeftRightIcon, ChevronRightIcon } from "lucide-react"
import { useDataTable } from "~/components/generics/data-table/data-table-context"

export const TableColumnVisibilityDropdown = () => {
  const table = useDataTable()
  const visibleColumns = table.getAllColumns().filter((c) => c.getIsVisible())
  const hideableColumns = table.getAllColumns().filter((c) => c.getCanHide())

  return (
    <Dropdown classNames={{ content: "p-0" }}>
      <DropdownTrigger className="flex">
        <Button
          startContent={
            <ArrowLeftRightIcon className="text-default-400" size={16} />
          }
          endContent={
            <ChevronRightIcon
              className="transition-transform group-aria-expanded:rotate-90"
              size={16}
            />
          }
          variant="flat"
        >
          Colunas
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        selectedKeys={visibleColumns.map((c) => c.id)}
        className="scrollbar-thin scrollbar-track-content2 scrollbar-thumb-primary max-h-80 overflow-y-auto p-2"
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
