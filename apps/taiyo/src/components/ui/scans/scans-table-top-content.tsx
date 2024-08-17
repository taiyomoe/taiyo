import { Button } from "@nextui-org/button"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown"
import { useAtom } from "jotai"
import { ChevronDownIcon, PlusIcon } from "lucide-react"
import { scansListVisibleColumnsAtom } from "~/atoms/scansList.atoms"
import { SearchInput } from "~/components/generics/inputs/search-input"
import { useScansList } from "~/hooks/useScansList"
import { columns } from "./scans-table"

export const ScansTableTopContent = () => {
  const [visibleColumns, setVisibleColumns] = useAtom(
    scansListVisibleColumnsAtom,
  )
  const { query, handleClear, handleQueryChange } = useScansList()

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
      <SearchInput
        className="w-full sm:w-1/3"
        placeholder="Pesquisar por nome..."
        value={query}
        onClear={handleClear}
        onValueChange={handleQueryChange}
      />
      <div className="flex justify-between sm:justify-normal sm:gap-4">
        <Dropdown>
          <DropdownTrigger className="flex">
            <Button
              endContent={<ChevronDownIcon className="text-small" />}
              variant="flat"
            >
              Colunas
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            disallowEmptySelection
            aria-label="Table columns"
            closeOnSelect={false}
            selectedKeys={visibleColumns}
            selectionMode="multiple"
            onSelectionChange={setVisibleColumns}
          >
            {columns.map((c) => (
              <DropdownItem key={c.uid}>{c.name}</DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
        <Button color="primary" endContent={<PlusIcon />}>
          Add New
        </Button>
      </div>
    </div>
  )
}
