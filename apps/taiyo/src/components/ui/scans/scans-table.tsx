"use client"

import { Button } from "@nextui-org/button"
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown"
import type { Selection } from "@nextui-org/react"
import { Spinner } from "@nextui-org/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table"
import type { ScansList } from "@taiyomoe/types"
import { ChevronDownIcon, EllipsisIcon, PlusIcon } from "lucide-react"
import { type Key, useCallback, useMemo, useState } from "react"
import { SearchInput } from "~/components/generics/inputs/search-input"
import { useScansList } from "~/hooks/useScansList"

const INITIAL_VISIBLE_COLUMNS = ["name", "chapters", "members", "actions"]
const columns = [
  { name: "ID", uid: "id" },
  { name: "NOME", uid: "name" },
  { name: "CAPÍTULOS", uid: "chapters" },
  { name: "MEMBROS", uid: "members" },
  { name: "AÇÕES", uid: "actions" },
]

type Props = {
  initialItems: ScansList
}

export const ScansTable = ({ initialItems }: Props) => {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]))
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  )
  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    )
  }, [visibleColumns])
  const { query, items, isLoading, handleQueryChange, handleClear } =
    useScansList(initialItems)

  const renderCell = useCallback((scan: ScansList[number], columnKey: Key) => {
    const value = scan[columnKey as keyof ScansList[number]]

    if (columnKey === "actions") {
      return (
        <div className="relative flex items-center justify-end gap-2">
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <EllipsisIcon className="text-default-300" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem>View</DropdownItem>
              <DropdownItem>Edit</DropdownItem>
              <DropdownItem>Delete</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      )
    }

    return value
  }, [])

  const topContent = useMemo(
    () => (
      <div className="flex justify-between">
        <SearchInput
          className="w-full sm:w-1/3"
          placeholder="Pesquisar por nome..."
          value={query}
          onClear={handleClear}
          onValueChange={handleQueryChange}
        />
        <div className="flex gap-4">
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button
                endContent={<ChevronDownIcon className="text-small" />}
                variant="flat"
              >
                Columns
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
              {columns.map((column) => (
                <DropdownItem key={column.uid} className="capitalize">
                  {column.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Button color="primary" endContent={<PlusIcon />}>
            Add New
          </Button>
        </div>
      </div>
    ),
    [visibleColumns, query, handleClear, handleQueryChange],
  )

  return (
    <div className="flex flex-col gap-12">
      <p className="font-semibold text-4xl">Scans</p>
      <div>
        <Table
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          topContent={topContent}
          topContentPlacement="outside"
          onSelectionChange={setSelectedKeys}
          aria-label="Scans list"
          isStriped
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={items}
            isLoading={isLoading}
            emptyContent="Nenhuma scan encontrada"
            loadingContent={<Spinner size="lg" />}
          >
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
